// nexus/frontend/src/types/index.ts

export type BusinessType = 'B2B' | 'B2C' | 'HYBRID';
export type ConnectionRole = 'BUYER' | 'SELLER' | 'INVESTOR';
export type ConnectionStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED';
export type UserRole = 'USER' | 'BUSINESS' | 'ADMIN';

export interface CompanyUpdate {
  id: string;
  title: string;
  body?: string;
  category: 'news' | 'funding' | 'product' | 'milestone';
  createdAt: string;
}

export interface Company {
  id: string;
  name: string;
  slug: string;
  description?: string;
  industry: string;
  businessType: BusinessType;
  foundedYear: number;
  employeeCount?: number;
  valuationLabel?: string;
  growthRate?: number;
  website?: string;
  logoUrl?: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  isFeatured: boolean;
  updates: CompanyUpdate[];
  tags: { tag: string }[];
  _count?: { connections: number };
}

export interface CompanyFilters {
  type?: BusinessType | '';
  industry?: string;
  minAge?: number;
  maxAge?: number;
  minValuation?: number;
  lat?: number;
  lng?: number;
  radius?: number;
  search?: string;
}

export interface Connection {
  id: string;
  companyId: string;
  role: ConnectionRole;
  message?: string;
  status: ConnectionStatus;
  createdAt: string;
  company: Pick<Company, 'id' | 'name' | 'slug' | 'industry' | 'city'>;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
  company?: { id: string; name: string; slug: string };
  _count?: { sentConnections: number; bookmarks: number };
}

export interface PaginatedResponse<T> {
  companies: T[];
  meta: { page: number; limit: number; total: number; pages: number };
}

export type MapView = 'cluster' | 'heatmap';
