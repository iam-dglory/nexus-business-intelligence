// nexus/backend/src/services/aiInsights.ts
/**
 * AI-powered business insights using the Anthropic API.
 * Generates summaries, match scores, and investment signals for companies.
 *
 * Usage: Set ANTHROPIC_API_KEY in .env to enable.
 * Falls back to static analysis if the key is not present.
 */
import { prisma } from '../utils/prisma';
import { redis } from '../utils/redis';
import { logger } from '../utils/logger';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const CACHE_TTL = 3600; // 1 hour

interface InsightResult {
  summary: string;
  strengths: string[];
  signals: string[];
  investmentScore: number; // 0–100
  matchTags: string[];
  generatedAt: string;
  source: 'ai' | 'static';
}

// ── Static fallback (no API key needed) ──────────────────────────────────────

function staticInsights(company: {
  name: string;
  industry: string;
  foundedYear: number;
  growthRate?: number | null;
  employeeCount?: number | null;
  businessType: string;
  valuationLabel?: string | null;
}): InsightResult {
  const age = new Date().getFullYear() - company.foundedYear;
  const growth = company.growthRate ?? 0;
  const employees = company.employeeCount ?? 0;

  const investmentScore = Math.min(
    100,
    Math.max(
      0,
      Math.round(
        (growth > 0 ? Math.min(growth / 3, 30) : 0) +
        (age < 5 ? 20 : age < 10 ? 15 : age < 20 ? 10 : 5) +
        (employees > 1000 ? 25 : employees > 100 ? 20 : employees > 10 ? 15 : 10) +
        (company.businessType === 'HYBRID' ? 15 : 10) +
        Math.random() * 10
      )
    )
  );

  const strengths: string[] = [];
  if (growth > 50) strengths.push('Hyper-growth trajectory');
  else if (growth > 20) strengths.push('Strong revenue growth');
  if (employees > 5000) strengths.push('Established enterprise scale');
  if (age < 5) strengths.push('Early-stage with high upside');
  if (company.businessType === 'B2B') strengths.push('Recurring B2B revenue model');
  if (company.businessType === 'HYBRID') strengths.push('Diversified revenue streams');
  if (strengths.length === 0) strengths.push('Stable operating history');

  const signals: string[] = [];
  if (growth > 100) signals.push('🚀 Exceptional growth — potential unicorn path');
  if (growth > 30) signals.push('📈 Above-market growth rate');
  if (age < 3) signals.push('⚡ Early-stage — high risk, high reward');
  if (employees > 10000) signals.push('🏢 Enterprise-grade operational maturity');
  if (signals.length === 0) signals.push('✓ Healthy business fundamentals');

  return {
    summary: `${company.name} is a ${age}-year-old ${company.industry.toLowerCase()} company operating on a ${company.businessType} model${company.valuationLabel ? ` with an estimated valuation of ${company.valuationLabel}` : ''}. ${growth > 0 ? `The company has demonstrated ${growth}% year-over-year growth, indicating strong market traction.` : 'The company maintains stable operations in its sector.'}`,
    strengths,
    signals,
    investmentScore,
    matchTags: [company.industry, company.businessType, age < 5 ? 'Startup' : age < 15 ? 'Growth Stage' : 'Mature'],
    generatedAt: new Date().toISOString(),
    source: 'static',
  };
}

// ── AI-powered insights (requires ANTHROPIC_API_KEY) ─────────────────────────

async function aiInsights(company: {
  name: string;
  industry: string;
  foundedYear: number;
  growthRate?: number | null;
  employeeCount?: number | null;
  businessType: string;
  valuationLabel?: string | null;
  description?: string | null;
  updates: { title: string; category: string }[];
}): Promise<InsightResult> {
  const prompt = `You are a senior business analyst at a top investment firm. Analyze this company and respond ONLY with valid JSON.

Company data:
- Name: ${company.name}
- Industry: ${company.industry}
- Type: ${company.businessType}
- Founded: ${company.foundedYear} (${new Date().getFullYear() - company.foundedYear} years old)
- Employees: ${company.employeeCount?.toLocaleString() ?? 'Unknown'}
- Valuation: ${company.valuationLabel ?? 'Unknown'}
- YoY Growth: ${company.growthRate != null ? `${company.growthRate}%` : 'Unknown'}
- Description: ${company.description ?? 'Not provided'}
- Recent updates: ${company.updates.slice(0, 3).map(u => u.title).join('; ') || 'None'}

Respond with this exact JSON structure:
{
  "summary": "2-3 sentence professional summary",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "signals": ["signal 1", "signal 2"],
  "investmentScore": 75,
  "matchTags": ["tag1", "tag2", "tag3"]
}

investmentScore must be 0-100. Be concise and data-driven.`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) throw new Error(`Anthropic API error: ${response.status}`);

  const data = await response.json();
  const text = data.content[0]?.text ?? '{}';

  // Strip any markdown code fences
  const clean = text.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
  const parsed = JSON.parse(clean);

  return {
    ...parsed,
    generatedAt: new Date().toISOString(),
    source: 'ai' as const,
  };
}

// ── Public interface ──────────────────────────────────────────────────────────

export async function getInsights(companyId: string): Promise<InsightResult | null> {
  const cacheKey = `insights:${companyId}`;

  // Check cache
  const cached = await redis.get(cacheKey).catch(() => null);
  if (cached) return JSON.parse(cached);

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: {
      updates: { take: 5, orderBy: { createdAt: 'desc' } },
    },
  });

  if (!company) return null;

  let result: InsightResult;

  if (ANTHROPIC_API_KEY) {
    try {
      result = await aiInsights(company);
      logger.info(`AI insights generated for ${company.name}`);
    } catch (err) {
      logger.warn(`AI insights failed for ${company.name}, falling back to static: ${err}`);
      result = staticInsights(company);
    }
  } else {
    result = staticInsights(company);
  }

  await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(result)).catch(() => null);
  return result;
}
