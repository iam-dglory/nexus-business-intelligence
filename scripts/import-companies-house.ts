// nexus/scripts/import-companies-house.ts
/**
 * Import real UK company data from Companies House API
 * https://developer.company-information.service.gov.uk/
 *
 * Usage:
 *   COMPANIES_HOUSE_API_KEY=xxx tsx scripts/import-companies-house.ts
 *
 * This will fetch ~1000 active UK companies and upsert them into your DB.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const API_KEY = process.env.COMPANIES_HOUSE_API_KEY;
const BASE = 'https://api.company-information.service.gov.uk';

// UK city coordinates lookup (extend as needed)
const UK_CITIES: Record<string, { lat: number; lng: number }> = {
  'London':     { lat: 51.51,  lng: -0.13 },
  'Manchester': { lat: 53.48,  lng: -2.24 },
  'Birmingham': { lat: 52.49,  lng: -1.90 },
  'Bristol':    { lat: 51.45,  lng: -2.59 },
  'Leeds':      { lat: 53.80,  lng: -1.55 },
  'Edinburgh':  { lat: 55.95,  lng: -3.19 },
  'Glasgow':    { lat: 55.86,  lng: -4.25 },
  'Liverpool':  { lat: 53.41,  lng: -2.99 },
  'Sheffield':  { lat: 53.38,  lng: -1.47 },
  'Cambridge':  { lat: 52.20,  lng:  0.12 },
  'Oxford':     { lat: 51.75,  lng: -1.25 },
  'Brighton':   { lat: 50.83,  lng: -0.14 },
};

function getCoords(locality?: string): { lat: number; lng: number } {
  if (locality) {
    for (const [city, coords] of Object.entries(UK_CITIES)) {
      if (locality.toLowerCase().includes(city.toLowerCase())) return coords;
    }
  }
  // Default to London with jitter
  return {
    lat: 51.51 + (Math.random() - 0.5) * 2,
    lng: -0.13 + (Math.random() - 0.5) * 3,
  };
}

async function fetchJson(url: string) {
  const res = await fetch(url, {
    headers: {
      Authorization: `Basic ${Buffer.from(`${API_KEY}:`).toString('base64')}`,
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} — ${url}`);
  return res.json();
}

async function main() {
  if (!API_KEY) {
    console.error('❌ Set COMPANIES_HOUSE_API_KEY env var');
    process.exit(1);
  }

  console.log('🇬🇧 Fetching UK companies from Companies House...');

  let imported = 0;
  const startIndex = 0;
  const pageSize = 100;
  const maxPages = 10; // 1000 companies

  for (let page = 0; page < maxPages; page++) {
    const url = `${BASE}/search/companies?q=limited&items_per_page=${pageSize}&start_index=${startIndex + page * pageSize}`;

    try {
      const data = await fetchJson(url);
      const items = data.items ?? [];

      for (const item of items) {
        if (item.company_status !== 'active') continue;

        const addr = item.registered_office_address ?? {};
        const coords = getCoords(addr.locality);
        const foundedYear = item.date_of_creation
          ? new Date(item.date_of_creation).getFullYear()
          : 2000;

        const slug = `${item.company_name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${item.company_number}`;

        await prisma.company.upsert({
          where: { slug },
          update: {},
          create: {
            name: item.company_name,
            slug,
            industry: 'Business Services', // Companies House doesn't provide SIC easily
            businessType: 'B2B',
            foundedYear,
            city: addr.locality ?? 'United Kingdom',
            country: 'GB',
            lat: coords.lat,
            lng: coords.lng,
          },
        });

        imported++;
      }

      console.log(`  Page ${page + 1}/${maxPages} — ${imported} imported`);
      await new Promise((r) => setTimeout(r, 500)); // rate limit
    } catch (err) {
      console.error(`  Error on page ${page}:`, err);
    }
  }

  console.log(`\n✅ Imported ${imported} UK companies`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
