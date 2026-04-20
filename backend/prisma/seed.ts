// nexus/backend/prisma/seed.ts
import { PrismaClient, BusinessType } from '@prisma/client';

const prisma = new PrismaClient();

const industries = [
  'Technology', 'Finance', 'Healthcare', 'Energy',
  'Retail', 'Manufacturing', 'Logistics', 'Education',
  'Real Estate', 'Media', 'Agriculture', 'Aerospace',
];

const techPrefixes = ['Nova', 'Apex', 'Quantum', 'Helio', 'Strata', 'Nexus', 'Polar', 'Velo', 'Aero', 'Crypt', 'Flux', 'Grid', 'Orbit', 'Prism', 'Zenith'];
const techSuffixes = ['Tech', 'Systems', 'Labs', 'AI', 'Data', 'Cloud', 'Net', 'Soft', 'Works', 'Group', 'Corp', 'Solutions', 'Digital', 'Ventures', 'Hub'];

const cities: Array<{ city: string; country: string; lat: number; lng: number }> = [
  // North America
  { city: 'New York', country: 'US', lat: 40.71, lng: -74.00 },
  { city: 'San Francisco', country: 'US', lat: 37.77, lng: -122.42 },
  { city: 'Los Angeles', country: 'US', lat: 34.05, lng: -118.24 },
  { city: 'Chicago', country: 'US', lat: 41.88, lng: -87.63 },
  { city: 'Austin', country: 'US', lat: 30.27, lng: -97.74 },
  { city: 'Seattle', country: 'US', lat: 47.61, lng: -122.33 },
  { city: 'Toronto', country: 'CA', lat: 43.65, lng: -79.38 },
  { city: 'Vancouver', country: 'CA', lat: 49.28, lng: -123.12 },
  // Europe
  { city: 'London', country: 'GB', lat: 51.51, lng: -0.13 },
  { city: 'Berlin', country: 'DE', lat: 52.52, lng: 13.40 },
  { city: 'Paris', country: 'FR', lat: 48.86, lng: 2.35 },
  { city: 'Amsterdam', country: 'NL', lat: 52.37, lng: 4.90 },
  { city: 'Stockholm', country: 'SE', lat: 59.33, lng: 18.07 },
  { city: 'Zurich', country: 'CH', lat: 47.38, lng: 8.54 },
  { city: 'Dublin', country: 'IE', lat: 53.33, lng: -6.25 },
  { city: 'Madrid', country: 'ES', lat: 40.42, lng: -3.70 },
  // Asia-Pacific
  { city: 'Tokyo', country: 'JP', lat: 35.69, lng: 139.69 },
  { city: 'Singapore', country: 'SG', lat: 1.35, lng: 103.82 },
  { city: 'Sydney', country: 'AU', lat: -33.87, lng: 151.21 },
  { city: 'Melbourne', country: 'AU', lat: -37.81, lng: 144.96 },
  { city: 'Shanghai', country: 'CN', lat: 31.23, lng: 121.47 },
  { city: 'Bangalore', country: 'IN', lat: 12.97, lng: 77.59 },
  { city: 'Seoul', country: 'KR', lat: 37.57, lng: 126.98 },
  { city: 'Hong Kong', country: 'HK', lat: 22.32, lng: 114.17 },
  // Middle East & Africa
  { city: 'Dubai', country: 'AE', lat: 25.20, lng: 55.27 },
  { city: 'Tel Aviv', country: 'IL', lat: 32.09, lng: 34.79 },
  { city: 'Nairobi', country: 'KE', lat: -1.29, lng: 36.82 },
  { city: 'Cape Town', country: 'ZA', lat: -33.93, lng: 18.42 },
  // South America
  { city: 'São Paulo', country: 'BR', lat: -23.55, lng: -46.63 },
  { city: 'Buenos Aires', country: 'AR', lat: -34.60, lng: -58.38 },
  { city: 'Bogotá', country: 'CO', lat: 4.71, lng: -74.07 },
];

const updateTemplates = [
  'Raised {amount} in Series {series} funding',
  'Launched new {product} platform',
  'Acquired {company} for {amount}',
  'Expanded operations to {region}',
  'Reached {milestone} active users',
  'Signed enterprise deal with {partner}',
  'Revenue up {pct}% year over year',
  'Released {product} v{version}',
  'Opened new office in {city}',
  'Partnership announced with {partner}',
];

function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateCompanyName(): string {
  const p = randomFrom(techPrefixes);
  const s = randomFrom(techSuffixes);
  return `${p}${s}`;
}

function generateSlug(name: string, idx: number): string {
  return `${name.toLowerCase().replace(/\s+/g, '-')}-${idx}`;
}

function generateValuation(employeeCount: number): { valuation: bigint; label: string } {
  const baseMultiplier = randomBetween(50000, 500000); // $ per employee
  const raw = employeeCount * baseMultiplier;
  const valuation = BigInt(raw) * 100n; // cents

  let label: string;
  if (raw >= 1_000_000_000_000) label = `$${(raw / 1e12).toFixed(1)}T`;
  else if (raw >= 1_000_000_000) label = `$${(raw / 1e9).toFixed(1)}B`;
  else if (raw >= 1_000_000) label = `$${(raw / 1e6).toFixed(0)}M`;
  else label = `$${(raw / 1000).toFixed(0)}K`;

  return { valuation, label };
}

function generateUpdate(companyName: string): string {
  const template = randomFrom(updateTemplates);
  return template
    .replace('{amount}', `$${randomBetween(5, 500)}M`)
    .replace('{series}', randomFrom(['A', 'B', 'C', 'D']))
    .replace('{product}', randomFrom(['AI', 'Cloud', 'Analytics', 'Data', 'Mobile']))
    .replace('{company}', generateCompanyName())
    .replace('{region}', randomFrom(['Asia-Pacific', 'EMEA', 'Latin America', 'North America']))
    .replace('{milestone}', `${randomBetween(1, 50)}M`)
    .replace('{partner}', generateCompanyName())
    .replace('{pct}', String(randomBetween(8, 180)))
    .replace('{version}', `${randomBetween(2, 5)}.0`)
    .replace('{city}', randomFrom(cities).city);
}

function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

async function main() {
  console.log('🌱 Seeding NEXUS database...');

  // Clear existing data
  await prisma.bookmark.deleteMany();
  await prisma.connection.deleteMany();
  await prisma.companyUpdate.deleteMany();
  await prisma.companyTag.deleteMany();
  await prisma.company.deleteMany();
  await prisma.user.deleteMany();

  // Create admin user
  const bcrypt = require('bcryptjs');
  const passwordHash = await bcrypt.hash('admin123', 10);
  await prisma.user.create({
    data: {
      email: 'admin@nexus.dev',
      passwordHash,
      name: 'NEXUS Admin',
      role: 'ADMIN',
    },
  });

  console.log('✓ Admin user created');

  // Create demo user
  const demoHash = await bcrypt.hash('demo123', 10);
  const demoUser = await prisma.user.create({
    data: {
      email: 'demo@nexus.dev',
      passwordHash: demoHash,
      name: 'Demo User',
      role: 'USER',
    },
  });

  console.log('✓ Demo user created');

  // Generate 500 companies
  const companyData = [];
  for (let i = 0; i < 500; i++) {
    const location = randomFrom(cities);
    const name = generateCompanyName();
    const industry = randomFrom(industries);
    const businessType = randomFrom([BusinessType.B2B, BusinessType.B2C, BusinessType.HYBRID]);
    const foundedYear = randomBetween(1970, 2023);
    const employeeCount = randomBetween(5, 80000);
    const { valuation, label: valuationLabel } = generateValuation(employeeCount);
    const growthRate = randomBetween(-15, 400) + Math.random();

    // Add small geographic jitter so companies don't stack exactly
    const latJitter = (Math.random() - 0.5) * 2;
    const lngJitter = (Math.random() - 0.5) * 3;

    companyData.push({
      name,
      slug: generateSlug(name, i),
      industry,
      businessType,
      foundedYear,
      employeeCount,
      valuation,
      valuationLabel,
      growthRate: Math.round(growthRate * 10) / 10,
      city: location.city,
      country: location.country,
      lat: location.lat + latJitter,
      lng: location.lng + lngJitter,
      description: `${name} is a leading ${industry.toLowerCase()} company based in ${location.city}. Founded in ${foundedYear}, we have grown to ${employeeCount.toLocaleString()} employees and serve clients across multiple continents.`,
    });
  }

  // Batch insert companies
  for (let i = 0; i < companyData.length; i += 50) {
    const batch = companyData.slice(i, i + 50);
    await Promise.all(
      batch.map(c =>
        prisma.company.create({
          data: {
            ...c,
            updates: {
              create: Array.from({ length: randomBetween(1, 4) }, (_, j) => ({
                title: generateUpdate(c.name),
                category: randomFrom(['news', 'funding', 'product', 'milestone']),
                createdAt: daysAgo(randomBetween(1, 90)),
              })),
            },
            tags: {
              create: Array.from(new Set(
                Array.from({ length: randomBetween(2, 5) }, () =>
                  randomFrom(['AI', 'SaaS', 'FinTech', 'HealthTech', 'GreenTech', 'B2B', 'Enterprise', 'Startup', 'Unicorn', 'Deep Tech'])
                )
              )).map(tag => ({ tag })),
            },
          },
        })
      )
    );
    console.log(`  ✓ Companies ${i + 1}–${Math.min(i + 50, companyData.length)} inserted`);
  }

  // Bookmark a few for demo user
  const firstFive = await prisma.company.findMany({ take: 5 });
  await prisma.bookmark.createMany({
    data: firstFive.map(c => ({ userId: demoUser.id, companyId: c.id })),
  });

  console.log('✓ Demo bookmarks created');
  console.log(`\n✅ Seed complete — 500 companies, 2 users`);
  console.log('\nDemo credentials:');
  console.log('  Email: demo@nexus.dev');
  console.log('  Password: demo123');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
