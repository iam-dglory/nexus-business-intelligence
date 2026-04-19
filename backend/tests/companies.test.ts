// nexus/backend/tests/companies.test.ts
import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/utils/prisma';

describe('GET /api/companies', () => {
  it('returns companies list with metadata', async () => {
    const res = await request(app).get('/api/companies');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.companies)).toBe(true);
    expect(res.body.meta).toBeDefined();
    expect(res.body.meta.total).toBeGreaterThan(0);
  });

  it('filters by business type', async () => {
    const res = await request(app).get('/api/companies?type=B2B');
    expect(res.status).toBe(200);
    res.body.companies.forEach((c: any) => {
      expect(c.businessType).toBe('B2B');
    });
  });

  it('filters by industry', async () => {
    const res = await request(app).get('/api/companies?industry=Technology');
    expect(res.status).toBe(200);
    res.body.companies.forEach((c: any) => {
      expect(c.industry).toBe('Technology');
    });
  });

  it('respects pagination', async () => {
    const res = await request(app).get('/api/companies?page=1&limit=10');
    expect(res.status).toBe(200);
    expect(res.body.companies.length).toBeLessThanOrEqual(10);
  });

  it('rejects invalid type filter', async () => {
    const res = await request(app).get('/api/companies?type=INVALID');
    expect(res.status).toBe(422);
  });
});

describe('GET /api/companies/search', () => {
  it('returns autocomplete results', async () => {
    const res = await request(app).get('/api/companies/search?q=tech');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('returns empty array for short query', async () => {
    const res = await request(app).get('/api/companies/search?q=a');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe('GET /api/companies/trending', () => {
  it('returns trending companies', async () => {
    const res = await request(app).get('/api/companies/trending');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeLessThanOrEqual(10);
  });
});

describe('GET /api/companies/:id', () => {
  it('returns 404 for nonexistent company', async () => {
    const res = await request(app).get('/api/companies/nonexistent-slug');
    expect(res.status).toBe(404);
  });

  it('returns company by id', async () => {
    const company = await prisma.company.findFirst();
    if (!company) return;
    const res = await request(app).get(`/api/companies/${company.id}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(company.id);
  });
});

afterAll(() => prisma.$disconnect());
