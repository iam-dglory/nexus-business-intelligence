// nexus/frontend/src/hooks/useCompanies.ts
import useSWR from 'swr';
import { api } from '../lib/api';
import { useStore } from '../store/useStore';

export function useCompanies() {
  const filters = useStore((s) => s.filters);

  const { data, error, isLoading, mutate } = useSWR(
    ['companies', filters],
    () => api.companies.list(filters),
    {
      revalidateOnFocus: false,
      dedupingInterval: 10_000,
    }
  );

  return {
    companies: data?.companies ?? [],
    total: data?.meta?.total ?? 0,
    isLoading,
    error,
    mutate,
  };
}

export function useCompany(id: string | null) {
  const { data, error, isLoading } = useSWR(
    id ? ['company', id] : null,
    () => api.companies.get(id!),
    { revalidateOnFocus: false }
  );

  return { company: data, isLoading, error };
}

export function useTrending() {
  const { data, isLoading } = useSWR('trending', api.companies.trending, {
    revalidateOnFocus: false,
    refreshInterval: 60_000,
  });
  return { trending: data ?? [], isLoading };
}
