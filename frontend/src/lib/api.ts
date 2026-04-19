// nexus/frontend/src/lib/api.ts
import type { Company, CompanyFilters, Connection, User, PaginatedResponse } from '../types';

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('nexus-storage');
    if (!raw) return null;
    return JSON.parse(raw)?.state?.token ?? null;
  } catch {
    return null;
  }
}

async function req<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `HTTP ${res.status}`);
  }

  return res.json();
}

// ── Companies ─────────────────────────────────────────────────────────────────
export function buildCompanyQuery(filters: CompanyFilters): string {
  const params = new URLSearchParams();
  if (filters.type)         params.set('type', filters.type);
  if (filters.industry)     params.set('industry', filters.industry);
  if (filters.minAge != null) params.set('minAge', String(filters.minAge));
  if (filters.maxAge != null) params.set('maxAge', String(filters.maxAge));
  if (filters.minValuation) params.set('minValuation', String(filters.minValuation));
  if (filters.lat != null)  params.set('lat', String(filters.lat));
  if (filters.lng != null)  params.set('lng', String(filters.lng));
  if (filters.radius)       params.set('radius', String(filters.radius));
  params.set('limit', '500');
  return params.toString();
}

export const api = {
  companies: {
    list: (filters: CompanyFilters = {}) =>
      req<PaginatedResponse<Company>>(`/companies?${buildCompanyQuery(filters)}`),
    get: (id: string) =>
      req<Company>(`/companies/${id}`),
    search: (q: string) =>
      req<Pick<Company, 'id' | 'name' | 'industry' | 'city' | 'country' | 'slug'>[]>(
        `/companies/search?q=${encodeURIComponent(q)}`
      ),
    trending: () =>
      req<Company[]>('/companies/trending'),
    create: (data: Partial<Company>) =>
      req<Company>('/companies', { method: 'POST', body: JSON.stringify(data) }),
  },

  auth: {
    register: (email: string, password: string, name: string) =>
      req<{ token: string; user: User }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, name }),
      }),
    login: (email: string, password: string) =>
      req<{ token: string; user: User }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    me: () => req<{ user: User }>('/auth/me'),
  },

  connections: {
    send: (companyId: string, role: string, message?: string) =>
      req<Connection>('/connections', {
        method: 'POST',
        body: JSON.stringify({ companyId, role, message }),
      }),
    list: () => req<Connection[]>('/connections'),
    respond: (id: string, status: 'ACCEPTED' | 'DECLINED') =>
      req<Connection>(`/connections/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
  },

  bookmarks: {
    list: () => req<Company[]>('/bookmarks'),
    add: (companyId: string) =>
      req<void>(`/bookmarks/${companyId}`, { method: 'POST' }),
    remove: (companyId: string) =>
      req<void>(`/bookmarks/${companyId}`, { method: 'DELETE' }),
  },
};
