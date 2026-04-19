// nexus/backend/src/controllers/companiesController.ts
import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { redis } from '../utils/redis';
import { AppError } from '../utils/AppError';

const CACHE_TTL = 300; // 5 minutes

const companySelect = {
  id: true,
  name: true,
  slug: true,
  industry: true,
  businessType: true,
  foundedYear: true,
  employeeCount: true,
  valuationLabel: true,
  growthRate: true,
  city: true,
  country: true,
  lat: true,
  lng: true,
  isFeatured: true,
  logoUrl: true,
  description: true,
  updates: {
    orderBy: { createdAt: 'desc' as const },
    take: 3,
    select: { id: true, title: true, category: true, createdAt: true },
  },
  tags: { select: { tag: true } },
  _count: { select: { connections: true } },
};

export async function listCompanies(req: Request, res: Response, next: NextFunction) {
  try {
    const {
      lat, lng, radius,
      type, industry,
      minAge, maxAge,
      minValuation,
      page = '1',
      limit = '200',
    } = req.query as Record<string, string>;

    const currentYear = new Date().getFullYear();
    const pageNum = parseInt(page);
    const limitNum = Math.min(parseInt(limit), 500);
    const skip = (pageNum - 1) * limitNum;

    // Build cache key
    const cacheKey = `companies:${JSON.stringify(req.query)}`;
    const cached = await redis.get(cacheKey).catch(() => null);
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    // Geospatial filter — use raw SQL with PostGIS when lat/lng/radius provided
    if (lat && lng && radius) {
      const latF = parseFloat(lat);
      const lngF = parseFloat(lng);
      const radiusM = parseFloat(radius) * 1000; // km → metres

      // Build WHERE clauses
      const conditions: string[] = [
        `ST_DWithin(
          ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
          ST_SetSRID(ST_MakePoint(${lngF}, ${latF}), 4326)::geography,
          ${radiusM}
        )`,
        `c."isActive" = true`,
      ];

      if (type) conditions.push(`c."businessType" = '${type}'`);
      if (industry) conditions.push(`c."industry" = '${industry}'`);
      if (minAge) conditions.push(`(${currentYear} - c."foundedYear") >= ${minAge}`);
      if (maxAge) conditions.push(`(${currentYear} - c."foundedYear") <= ${maxAge}`);
      if (minValuation) conditions.push(`c."valuation" >= ${BigInt(minValuation) * 100n}`);

      const where = conditions.join(' AND ');

      const companies = await prisma.$queryRawUnsafe(`
        SELECT c.id, c.name, c.slug, c.industry, c."businessType",
               c."foundedYear", c."employeeCount", c."valuationLabel",
               c."growthRate", c.city, c.country, c.lat, c.lng,
               c."isFeatured", c."logoUrl"
        FROM companies c
        WHERE ${where}
        ORDER BY c."isFeatured" DESC, c."growthRate" DESC NULLS LAST
        LIMIT ${limitNum} OFFSET ${skip}
      `);

      const result = { companies, meta: { page: pageNum, limit: limitNum } };
      await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(result)).catch(() => null);
      return res.json(result);
    }

    // Standard Prisma filter (no radius)
    const currentYearInt = currentYear;
    const where: any = { isActive: true };
    if (type) where.businessType = type;
    if (industry) where.industry = industry;
    if (minAge || maxAge) {
      where.foundedYear = {};
      if (maxAge) where.foundedYear.gte = currentYearInt - parseInt(maxAge);
      if (minAge) where.foundedYear.lte = currentYearInt - parseInt(minAge);
    }

    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        where,
        select: companySelect,
        orderBy: [{ isFeatured: 'desc' }, { growthRate: 'desc' }],
        skip,
        take: limitNum,
      }),
      prisma.company.count({ where }),
    ]);

    const result = {
      companies,
      meta: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    };

    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(result)).catch(() => null);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getCompany(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    const cacheKey = `company:${id}`;
    const cached = await redis.get(cacheKey).catch(() => null);
    if (cached) return res.json(JSON.parse(cached));

    const company = await prisma.company.findFirst({
      where: { OR: [{ id }, { slug: id }], isActive: true },
      select: {
        ...companySelect,
        updates: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: { id: true, title: true, body: true, category: true, createdAt: true },
        },
      },
    });

    if (!company) throw new AppError('Company not found', 404);

    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(company)).catch(() => null);
    res.json(company);
  } catch (err) {
    next(err);
  }
}

export async function searchCompanies(req: Request, res: Response, next: NextFunction) {
  try {
    const { q } = req.query as { q: string };
    if (!q || q.length < 2) return res.json([]);

    const results = await prisma.company.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { industry: { contains: q, mode: 'insensitive' } },
          { city: { contains: q, mode: 'insensitive' } },
          { country: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
        ],
      },
      select: { id: true, name: true, industry: true, city: true, country: true, slug: true },
      take: 10,
    });

    res.json(results);
  } catch (err) {
    next(err);
  }
}

export async function getTrending(req: Request, res: Response, next: NextFunction) {
  try {
    const cacheKey = 'companies:trending';
    const cached = await redis.get(cacheKey).catch(() => null);
    if (cached) return res.json(JSON.parse(cached));

    // Trending = most connections + highest growth rate + recent updates
    const trending = await prisma.company.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        industry: true,
        businessType: true,
        growthRate: true,
        valuationLabel: true,
        city: true,
        country: true,
        lat: true,
        lng: true,
        _count: { select: { connections: true } },
      },
      orderBy: [
        { connections: { _count: 'desc' } },
        { growthRate: 'desc' },
      ],
      take: 10,
    });

    await redis.setex(cacheKey, 60, JSON.stringify(trending)).catch(() => null);
    res.json(trending);
  } catch (err) {
    next(err);
  }
}

export async function createCompany(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.userId!;

    const existing = await prisma.company.findFirst({ where: { ownerId: userId } });
    if (existing) throw new AppError('You already have a company listed', 409);

    const {
      name, industry, businessType, foundedYear,
      employeeCount, valuationLabel, city, country, lat, lng,
      description, website,
    } = req.body;

    const slug = `${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;

    const company = await prisma.company.create({
      data: {
        name, slug, industry, businessType, foundedYear,
        employeeCount, valuationLabel, city, country, lat, lng,
        description, website,
        ownerId: userId,
      },
      select: companySelect,
    });

    // Invalidate list cache
    const keys = await redis.keys('companies:*').catch(() => []);
    if (keys.length) await redis.del(keys).catch(() => null);

    res.status(201).json(company);
  } catch (err) {
    next(err);
  }
}
