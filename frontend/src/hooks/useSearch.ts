// nexus/frontend/src/hooks/useSearch.ts
import { useState, useEffect, useRef } from 'react';
import { api } from '../lib/api';
import type { Company } from '../types';

type SearchResult = Pick<Company, 'id' | 'name' | 'industry' | 'city' | 'country' | 'slug'>;

export function useSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const data = await api.companies.search(query);
        setResults(data);
      } catch {
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  return { query, setQuery, results, isSearching };
}
