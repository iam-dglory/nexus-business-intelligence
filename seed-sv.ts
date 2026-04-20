// npx tsx scripts/seed-sv.ts
import { PrismaClient, BusinessType } from '@prisma/client';
const prisma = new PrismaClient();

const SV_COMPANIES = [
  // ── FAANG / MEGA CAP ─────────────────────────────────────────────────────────
  { name:'Apple',           industry:'Technology',  type:'HYBRID', founded:1976, employees:164000, val:'$3T',    growth:8.1,  lat:37.3349, lng:-122.0090, city:'Cupertino',      yc:false },
  { name:'Google (Alphabet)',industry:'Technology', type:'HYBRID', founded:1998, employees:182000, val:'$2.1T',  growth:11.0, lat:37.4220, lng:-122.0840, city:'Mountain View',   yc:false },
  { name:'Meta Platforms',  industry:'Technology',  type:'B2C',    founded:2004, employees:86482,  val:'$1.3T',  growth:16.0, lat:37.4847, lng:-122.1477, city:'Menlo Park',      yc:false },
  { name:'Netflix',         industry:'Media',       type:'B2C',    founded:1997, employees:13000,  val:'$280B',  growth:8.0,  lat:37.2682, lng:-121.9609, city:'Los Gatos',       yc:false },
  { name:'Oracle',          industry:'Technology',  type:'B2B',    founded:1977, employees:164000, val:'$340B',  growth:9.0,  lat:37.5290, lng:-122.2648, city:'Redwood City',    yc:false },
  { name:'Salesforce',      industry:'Technology',  type:'B2B',    founded:1999, employees:79390,  val:'$230B',  growth:11.0, lat:37.7946, lng:-122.3999, city:'San Francisco',   yc:false },
  { name:'Adobe',           industry:'Technology',  type:'HYBRID', founded:1982, employees:30090,  val:'$200B',  growth:12.0, lat:37.3318, lng:-121.8938, city:'San Jose',        yc:false },
  { name:'Intel',           industry:'Technology',  type:'B2B',    founded:1968, employees:124800, val:'$90B',   growth:-15.0,lat:37.3875, lng:-121.9631, city:'Santa Clara',     yc:false },
  { name:'Cisco Systems',   industry:'Technology',  type:'B2B',    founded:1984, employees:84900,  val:'$200B',  growth:4.0,  lat:37.4078, lng:-121.9603, city:'San Jose',        yc:false },
  { name:'HP Inc',          industry:'Technology',  type:'HYBRID', founded:1939, employees:61000,  val:'$35B',   growth:3.0,  lat:37.3161, lng:-122.0559, city:'Palo Alto',       yc:false },

  // ── UNICORNS & GROWTH ────────────────────────────────────────────────────────
  { name:'Stripe',          industry:'Finance',     type:'B2B',    founded:2010, employees:8000,   val:'$65B',   growth:25.0, lat:37.7800, lng:-122.3950, city:'San Francisco',   yc:false },
  { name:'Airbnb',          industry:'Retail',      type:'B2C',    founded:2008, employees:6907,   val:'$80B',   growth:18.0, lat:37.7759, lng:-122.4072, city:'San Francisco',   yc:true  },
  { name:'DoorDash',        industry:'Logistics',   type:'B2C',    founded:2013, employees:16800,  val:'$20B',   growth:22.0, lat:37.7510, lng:-122.4180, city:'San Francisco',   yc:false },
  { name:'Lyft',            industry:'Logistics',   type:'B2C',    founded:2012, employees:5000,   val:'$5B',    growth:-8.0, lat:37.7591, lng:-122.4167, city:'San Francisco',   yc:false },
  { name:'Uber',            industry:'Logistics',   type:'B2C',    founded:2009, employees:32800,  val:'$145B',  growth:17.0, lat:37.7749, lng:-122.4194, city:'San Francisco',   yc:false },
  { name:'Twitter / X',     industry:'Media',       type:'HYBRID', founded:2006, employees:1500,   val:'$19B',   growth:-20.0,lat:37.7768, lng:-122.4160, city:'San Francisco',   yc:false },
  { name:'Reddit',          industry:'Media',       type:'B2C',    founded:2005, employees:2000,   val:'$10B',   growth:21.0, lat:37.7749, lng:-122.4194, city:'San Francisco',   yc:true  },
  { name:'Pinterest',       industry:'Media',       type:'B2C',    founded:2010, employees:3500,   val:'$15B',   growth:6.0,  lat:37.7749, lng:-122.4194, city:'San Francisco',   yc:false },
  { name:'Dropbox',         industry:'Technology',  type:'HYBRID', founded:2007, employees:2700,   val:'$10B',   growth:-2.0, lat:37.7749, lng:-122.4194, city:'San Francisco',   yc:true  },
  { name:'Slack',           industry:'Technology',  type:'B2B',    founded:2009, employees:2500,   val:'$28B',   growth:36.0, lat:37.7827, lng:-122.3965, city:'San Francisco',   yc:false },
  { name:'Palantir',        industry:'Technology',  type:'B2B',    founded:2003, employees:3800,   val:'$55B',   growth:17.0, lat:37.4419, lng:-122.1430, city:'Palo Alto',       yc:false },
  { name:'Snowflake',       industry:'Technology',  type:'B2B',    founded:2012, employees:7000,   val:'$50B',   growth:34.0, lat:37.3861, lng:-122.0839, city:'Menlo Park',      yc:false },
  { name:'Cloudflare',      industry:'Technology',  type:'B2B',    founded:2009, employees:4000,   val:'$25B',   growth:28.0, lat:37.7749, lng:-122.4194, city:'San Francisco',   yc:false },
  { name:'Twilio',          industry:'Technology',  type:'B2B',    founded:2008, employees:5000,   val:'$10B',   growth:4.0,  lat:37.7749, lng:-122.4194, city:'San Francisco',   yc:false },
  { name:'Figma',           industry:'Technology',  type:'B2B',    founded:2012, employees:1400,   val:'$20B',   growth:45.0, lat:37.7749, lng:-122.4194, city:'San Francisco',   yc:false },
  { name:'Notion',          industry:'Technology',  type:'HYBRID', founded:2016, employees:400,    val:'$10B',   growth:60.0, lat:37.7749, lng:-122.4194, city:'San Francisco',   yc:false },
  { name:'Vercel',          industry:'Technology',  type:'B2B',    founded:2015, employees:700,    val:'$3.25B', growth:80.0, lat:37.7749, lng:-122.4194, city:'San Francisco',   yc:false },
  { name:'Rippling',        industry:'Finance',     type:'B2B',    founded:2016, employees:3000,   val:'$13.5B', growth:55.0, lat:37.7749, lng:-122.4194, city:'San Francisco',   yc:false },
  { name:'Brex',            industry:'Finance',     type:'B2B',    founded:2017, employees:1200,   val:'$12.3B', growth:40.0, lat:37.7749, lng:-122.4194, city:'San Francisco',   yc:true  },
  { name:'Gusto',           industry:'Finance',     type:'B2B',    founded:2011, employees:2700,   val:'$9.5B',  growth:30.0, lat:37.7749, lng:-122.4194, city:'San Francisco',   yc:false },

  // ── YC ALUMNI ────────────────────────────────────────────────────────────────
  { name:'Coinbase',        industry:'Finance',     type:'HYBRID', founded:2012, employees:3700,   val:'$12B',   growth:35.0, lat:37.7749, lng:-122.4194, city:'San Francisco',   yc:true  },
  { name:'Instacart',       industry:'Retail',      type:'B2C',    founded:2012, employees:3000,   val:'$9B',    growth:4.0,  lat:37.7749, lng:-122.4194, city:'San Francisco',   yc:true  },
  { name:'Doordash',        industry:'Logistics',   type:'B2C',    founded:2013, employees:16800,  val:'$20B',   growth:22.0, lat:37.7510, lng:-122.4150, city:'San Francisco',   yc:true  },
  { name:'Twitch',          industry:'Media',       type:'B2C',    founded:2011, employees:1900,   val:'$15B',   growth:8.0,  lat:37.4419, lng:-122.1431, city:'Palo Alto',       yc:true  },
  { name:'Cruise (GM)',     industry:'Technology',  type:'B2B',    founded:2013, employees:3000,   val:'$19B',   growth:0.0,  lat:37.7749, lng:-122.4194, city:'San Francisco',   yc:true  },
  { name:'Gitlab',          industry:'Technology',  type:'B2B',    founded:2011, employees:2100,   val:'$15B',   growth:33.0, lat:37.7749, lng:-122.4194, city:'San Francisco',   yc:false },
  { name:'Amplitude',       industry:'Technology',  type:'B2B',    founded:2012, employees:700,    val:'$4B',    growth:27.0, lat:37.7749, lng:-122.4194, city:'San Francisco',   yc:true  },
  { name:'Retool',          industry:'Technology',  type:'B2B',    founded:2017, employees:500,    val:'$3.2B',  growth:70.0, lat:37.7749, lng:-122.4194, city:'San Francisco',   yc:true  },
  { name:'Deel',            industry:'Finance',     type:'B2B',    founded:2019, employees:4000,   val:'$12B',   growth:425.0,lat:37.7749, lng:-122.4194, city:'San Francisco',   yc:true  },
  { name:'Mercury',         industry:'Finance',     type:'B2B',    founded:2019, employees:700,    val:'$1.6B',  growth:95.0, lat:37.7749, lng:-122.4194, city:'San Francisco',   yc:true  },
  { name:'Segment',         industry:'Technology',  type:'B2B',    founded:2011, employees:600,    val:'$3.2B',  growth:40.0, lat:37.7749, lng:-122.4194, city:'San Francisco',   yc:true  },
  { name:'PagerDuty',       industry:'Technology',  type:'B2B',    founded:2009, employees:900,    val:'$2B',    growth:14.0, lat:37.7749, lng:-122.4194, city:'San Francisco',   yc:false },
  { name:'Zapier',          industry:'Technology',  type:'B2B',    founded:2011, employees:800,    val:'$5B',    growth:35.0, lat:37.6879, lng:-122.4702, city:'San Francisco',   yc:true  },
  { name:'Airtable',        industry:'Technology',  type:'B2B',    founded:2012, employees:900,    val:'$11.7B', growth:55.0, lat:37.7749, lng:-122.4194, city:'San Francisco',   yc:false },
  { name:'Linear',          industry:'Technology',  type:'B2B',    founded:2019, employees:100,    val:'$400M',  growth:120.0,lat:37.7749, lng:-122.4194, city:'San Francisco',   yc:false },

  // ── DEEP TECH & AI ───────────────────────────────────────────────────────────
  { name:'OpenAI',          industry:'Technology',  type:'HYBRID', founded:2015, employees:1700,   val:'$90B',   growth:250.0,lat:37.7749, lng:-122.4194, city:'San Francisco',   yc:false },
  { name:'Anthropic',       industry:'Technology',  type:'B2B',    founded:2021, employees:800,    val:'$18B',   growth:300.0,lat:37.7749, lng:-122.4194, city:'San Francisco',   yc:false },
  { name:'Scale AI',        industry:'Technology',  type:'B2B',    founded:2016, employees:1000,   val:'$13.8B', growth:90.0, lat:37.7749, lng:-122.4194, city:'San Francisco',   yc:true  },
  { name:'Cohere',          industry:'Technology',  type:'B2B',    founded:2019, employees:500,    val:'$2.1B',  growth:180.0,lat:37.7749, lng:-122.4194, city:'San Francisco',   yc:false },
  { name:'Anyscale',        industry:'Technology',  type:'B2B',    founded:2019, employees:400,    val:'$1B',    growth:150.0,lat:37.7749, lng:-122.4194, city:'San Francisco',   yc:false },
  { name:'Weights & Biases',industry:'Technology',  type:'B2B',    founded:2017, employees:600,    val:'$1.25B', growth:90.0, lat:37.7749, lng:-122.4194, city:'San Francisco',   yc:false },
  { name:'Hugging Face',    industry:'Technology',  type:'B2B',    founded:2016, employees:300,    val:'$4.5B',  growth:200.0,lat:37.7749, lng:-122.4194, city:'New York',        yc:false },
  { name:'Together AI',     industry:'Technology',  type:'B2B',    founded:2022, employees:80,     val:'$1.25B', growth:500.0,lat:37.7749, lng:-122.4194, city:'San Francisco',   yc:false },
  { name:'Mistral AI',      industry:'Technology',  type:'B2B',    founded:2023, employees:40,     val:'$6B',    growth:800.0,lat:48.8566, lng:2.3522,    city:'Paris',           yc:false },
  { name:'Replit',          industry:'Technology',  type:'HYBRID', founded:2016, employees:200,    val:'$1.16B', growth:110.0,lat:37.7749, lng:-122.4194, city:'San Francisco',   yc:true  },

  // ── PALO ALTO / STANFORD BELT ────────────────────────────────────────────────
  { name:'Tesla',           industry:'Manufacturing',type:'B2C',   founded:2003, employees:140473, val:'$600B',  growth:19.0, lat:37.3861, lng:-122.0839, city:'Palo Alto',       yc:false },
  { name:'SpaceX',          industry:'Aerospace',   type:'B2B',    founded:2002, employees:13000,  val:'$180B',  growth:30.0, lat:33.9206, lng:-118.3280, city:'Hawthorne',       yc:false },
  { name:'LinkedIn',        industry:'Media',       type:'HYBRID', founded:2002, employees:20000,  val:'$26B',   growth:9.0,  lat:37.3886, lng:-122.0822, city:'Sunnyvale',       yc:false },
  { name:'Yahoo',           industry:'Media',       type:'HYBRID', founded:1995, employees:8600,   val:'$6B',    growth:-5.0, lat:37.4185, lng:-122.0257, city:'Sunnyvale',       yc:false },
  { name:'VMware (Broadcom)',industry:'Technology', type:'B2B',    founded:1998, employees:37000,  val:'$69B',   growth:5.0,  lat:37.4052, lng:-122.0493, city:'Palo Alto',       yc:false },
  { name:'PayPal',          industry:'Finance',     type:'HYBRID', founded:1998, employees:29900,  val:'$65B',   growth:-4.0, lat:37.3861, lng:-122.0839, city:'San Jose',        yc:false },
  { name:'eBay',            industry:'Retail',      type:'HYBRID', founded:1995, employees:11600,  val:'$25B',   growth:1.0,  lat:37.3752, lng:-121.9669, city:'San Jose',        yc:false },

  // ── SAN JOSE CORRIDOR ────────────────────────────────────────────────────────
  { name:'ServiceNow',      industry:'Technology',  type:'B2B',    founded:2004, employees:22000,  val:'$165B',  growth:23.0, lat:37.3861, lng:-121.9694, city:'Santa Clara',     yc:false },
  { name:'Zoom Video',      industry:'Technology',  type:'HYBRID', founded:2011, employees:8400,   val:'$20B',   growth:-4.0, lat:37.3719, lng:-122.0496, city:'San Jose',        yc:false },
  { name:'Box',             industry:'Technology',  type:'B2B',    founded:2005, employees:2700,   val:'$4B',    growth:5.0,  lat:37.4774, lng:-122.1591, city:'Redwood City',    yc:false },
  { name:'Palo Alto Networks',industry:'Technology',type:'B2B',   founded:2005, employees:14000,  val:'$100B',  growth:25.0, lat:37.4028, lng:-122.1160, city:'Santa Clara',     yc:false },
  { name:'Fortinet',        industry:'Technology',  type:'B2B',    founded:2000, employees:13500,  val:'$55B',   growth:18.0, lat:37.3764, lng:-122.0293, city:'Sunnyvale',       yc:false },
  { name:'Arista Networks', industry:'Technology',  type:'B2B',    founded:2004, employees:4000,   val:'$80B',   growth:33.0, lat:37.3715, lng:-122.0328, city:'Santa Clara',     yc:false },
];

function parseVal(v: string): bigint | undefined {
  const n = parseFloat(v.replace(/[^0-9.]/g, ''));
  if (v.includes('T')) return BigInt(Math.round(n * 1e12)) * 100n;
  if (v.includes('B')) return BigInt(Math.round(n * 1e9)) * 100n;
  if (v.includes('M')) return BigInt(Math.round(n * 1e6)) * 100n;
  return undefined;
}

async function main() {
  console.log('🌉 Seeding Silicon Valley companies...');
  let inserted = 0, updated = 0;

  for (const c of SV_COMPANIES) {
    const slug = `${c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-sv`;
    const tags = [
      { tag: 'Silicon Valley' },
      { tag: c.industry },
      { tag: c.type },
      ...(c.yc ? [{ tag: 'YC' }, { tag: 'Y Combinator' }] : []),
      ...((c.val.includes('T') || (c.val.includes('B') && parseFloat(c.val) >= 10)) ? [{ tag: 'Unicorn' }] : []),
      ...(c.growth > 50 ? [{ tag: 'Hypergrowth' }] : []),
      ...(c.industry === 'Technology' && c.founded >= 2015 ? [{ tag: 'AI Era' }] : []),
    ].filter((t, i, arr) => arr.findIndex(x => x.tag === t.tag) === i);

    try {
      await prisma.company.upsert({
        where: { slug },
        update: { valuationLabel: c.val, growthRate: c.growth, employeeCount: c.employees },
        create: {
          name: c.name, slug,
          industry: c.industry,
          businessType: c.type as BusinessType,
          foundedYear: c.founded,
          employeeCount: c.employees,
          valuation: parseVal(c.val),
          valuationLabel: c.val,
          growthRate: c.growth,
          city: c.city, country: 'US',
          lat: c.lat + (Math.random() - 0.5) * 0.01,
          lng: c.lng + (Math.random() - 0.5) * 0.01,
          description: `${c.name} is a ${c.industry.toLowerCase()} company founded in ${c.founded}, based in ${c.city}${c.yc ? ', and a Y Combinator alumni' : ''}. Valued at ${c.val} with ${c.employees.toLocaleString()} employees.`,
          tags: { create: tags },
          updates: {
            create: [
              { title: `${c.name} posts ${c.growth > 0 ? '+' : ''}${c.growth}% revenue growth`, category: 'news' },
              { title: `${c.name} ${c.yc ? '(YC Alumni) ' : ''}expands product offerings`, category: 'product' },
            ],
          },
        },
      });
      inserted++;
      process.stdout.write(`\r  ✓ ${inserted} processed`);
    } catch (e) { updated++; }
  }

  const total = await prisma.company.count();
  const ycCount = await prisma.companyTag.count({ where: { tag: 'YC' } });

  console.log(`\n\n✅ Silicon Valley seeded — ${inserted} companies added`);
  console.log(`🅨  YC-backed companies: ${ycCount}`);
  console.log(`📊 Total in database: ${total}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
