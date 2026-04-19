// nexus/scripts/import-asic.ts
/**
 * Import Australian company data from the ASIC (Australian Securities &
 * Investments Commission) public dataset.
 *
 * ASIC publishes a free bulk extract of registered company names at:
 *   https://data.gov.au/data/dataset/asic-company-register
 *
 * Usage:
 *   1. Download the CSV from the URL above and save as scripts/asic-companies.csv
 *   2. Run: tsx scripts/import-asic.ts
 *
 * The CSV format is:
 *   Company Name, ACN, ABN, Company Type, Company Class, Company Status,
 *   Date Registered, Previous State Registered, Locality, State, Postcode
 */
import { createReadStream } from 'fs';
import { createInterface } from 'readline';
import { join } from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Major AU city coordinates
const AU_CITIES: Record<string, { lat: number; lng: number }> = {
  'SYDNEY':     { lat: -33.87, lng: 151.21 },
  'MELBOURNE':  { lat: -37.81, lng: 144.96 },
  'BRISBANE':   { lat: -27.47, lng: 153.02 },
  'PERTH':      { lat: -31.95, lng: 115.86 },
  'ADELAIDE':   { lat: -34.93, lng: 138.60 },
  'CANBERRA':   { lat: -35.28, lng: 149.13 },
  'HOBART':     { lat: -42.88, lng: 147.33 },
  'DARWIN':     { lat: -12.46, lng: 130.84 },
  'GOLD COAST': { lat: -28.00, lng: 153.43 },
  'NEWCASTLE':  { lat: -32.93, lng: 151.78 },
};

function getCoords(locality: string, state: string): { lat: number; lng: number } {
  const upper = locality.toUpperCase();
  if (AU_CITIES[upper]) return AU_CITIES[upper];

  // State fallbacks with jitter
  const stateCentres: Record<string, { lat: number; lng: number }> = {
    NSW: { lat: -33.87, lng: 151.21 },
    VIC: { lat: -37.81, lng: 144.96 },
    QLD: { lat: -27.47, lng: 153.02 },
    WA:  { lat: -31.95, lng: 115.86 },
    SA:  { lat: -34.93, lng: 138.60 },
    ACT: { lat: -35.28, lng: 149.13 },
    TAS: { lat: -42.88, lng: 147.33 },
    NT:  { lat: -12.46, lng: 130.84 },
  };

  const centre = stateCentres[state?.toUpperCase()] ?? { lat: -25.27, lng: 133.77 };
  return {
    lat: centre.lat + (Math.random() - 0.5) * 3,
    lng: centre.lng + (Math.random() - 0.5) * 4,
  };
}

function guessIndustry(name: string): string {
  const n = name.toUpperCase();
  if (n.includes('TECH') || n.includes('SOFTWARE') || n.includes('DIGITAL') || n.includes('DATA')) return 'Technology';
  if (n.includes('FINANCE') || n.includes('CAPITAL') || n.includes('INVEST') || n.includes('BANK')) return 'Finance';
  if (n.includes('HEALTH') || n.includes('MED') || n.includes('CARE') || n.includes('PHARMA')) return 'Healthcare';
  if (n.includes('ENERGY') || n.includes('SOLAR') || n.includes('POWER') || n.includes('MINING')) return 'Energy';
  if (n.includes('RETAIL') || n.includes('SHOP') || n.includes('STORE') || n.includes('MARKET')) return 'Retail';
  if (n.includes('BUILD') || n.includes('CONSTRUCT') || n.includes('PROPERTY') || n.includes('REAL ESTATE')) return 'Real Estate';
  if (n.includes('TRANSPORT') || n.includes('LOGISTICS') || n.includes('FREIGHT')) return 'Logistics';
  if (n.includes('EDUCATION') || n.includes('SCHOOL') || n.includes('LEARNING')) return 'Education';
  if (n.includes('MEDIA') || n.includes('PUBLISH') || n.includes('BROADCAST')) return 'Media';
  if (n.includes('FARM') || n.includes('AGRI') || n.includes('PASTORAL')) return 'Agriculture';
  return 'Business Services';
}

async function main() {
  const csvPath = join(__dirname, 'asic-companies.csv');

  try {
    await import('fs').then(fs => {
      if (!fs.existsSync(csvPath)) {
        throw new Error(`CSV file not found at ${csvPath}\nDownload from: https://data.gov.au/data/dataset/asic-company-register`);
      }
    });
  } catch (err: any) {
    console.error('❌', err.message);
    process.exit(1);
  }

  console.log('🇦🇺 Importing ASIC companies...');

  const rl = createInterface({
    input: createReadStream(csvPath),
    crlfDelay: Infinity,
  });

  let lineNum = 0;
  let imported = 0;
  let skipped = 0;
  const batch: any[] = [];
  const BATCH_SIZE = 100;

  for await (const line of rl) {
    lineNum++;
    if (lineNum === 1) continue; // skip header

    const cols = line.split(',').map((c) => c.replace(/^"|"$/g, '').trim());
    const [name, , , companyType, , status, dateRegistered, , locality, state] = cols;

    if (status !== 'REGD' && status !== 'SOFF') { skipped++; continue; }
    if (!name || name.length < 3) { skipped++; continue; }

    const foundedYear = dateRegistered
      ? new Date(dateRegistered).getFullYear()
      : 2000;

    if (isNaN(foundedYear)) { skipped++; continue; }

    const coords = getCoords(locality ?? '', state ?? '');
    const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 60)}-${lineNum}`;

    batch.push({
      name: name.slice(0, 200),
      slug,
      industry: guessIndustry(name),
      businessType: companyType?.includes('PROP') ? 'B2C' : 'B2B',
      foundedYear,
      city: locality ? locality.charAt(0).toUpperCase() + locality.slice(1).toLowerCase() : state ?? 'Australia',
      country: 'AU',
      lat: coords.lat,
      lng: coords.lng,
    });

    if (batch.length >= BATCH_SIZE) {
      await prisma.company.createMany({ data: batch, skipDuplicates: true });
      imported += batch.length;
      batch.length = 0;
      if (imported % 1000 === 0) console.log(`  ✓ ${imported.toLocaleString()} imported...`);
    }
  }

  // Flush remaining
  if (batch.length > 0) {
    await prisma.company.createMany({ data: batch, skipDuplicates: true });
    imported += batch.length;
  }

  console.log(`\n✅ Done — ${imported.toLocaleString()} companies imported, ${skipped.toLocaleString()} skipped`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
