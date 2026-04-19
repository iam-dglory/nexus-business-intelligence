// nexus/frontend/src/store/useStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Company, CompanyFilters, User, MapView } from '../types';

interface NexusState {
  // Auth
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;

  // Selected company
  selectedCompany: Company | null;
  setSelectedCompany: (company: Company | null) => void;

  // Filters
  filters: CompanyFilters;
  setFilters: (filters: Partial<CompanyFilters>) => void;
  resetFilters: () => void;

  // Map view
  mapView: MapView;
  setMapView: (view: MapView) => void;

  // Bookmarks (optimistic local state)
  bookmarkedIds: Set<string>;
  toggleBookmark: (id: string) => void;

  // Compare
  compareIds: string[];
  toggleCompare: (id: string) => void;
  clearCompare: () => void;

  // UI
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  connectModalOpen: boolean;
  setConnectModalOpen: (open: boolean) => void;
}

const DEFAULT_FILTERS: CompanyFilters = {};

export const useStore = create<NexusState>()(
  persist(
    (set, get) => ({
      // Auth
      user: null,
      token: null,
      setAuth: (user, token) => set({ user, token }),
      clearAuth: () => set({ user: null, token: null }),

      // Company
      selectedCompany: null,
      setSelectedCompany: (company) => set({ selectedCompany: company }),

      // Filters
      filters: DEFAULT_FILTERS,
      setFilters: (f) => set((s) => ({ filters: { ...s.filters, ...f } })),
      resetFilters: () => set({ filters: DEFAULT_FILTERS }),

      // View
      mapView: 'cluster',
      setMapView: (mapView) => set({ mapView }),

      // Bookmarks
      bookmarkedIds: new Set(),
      toggleBookmark: (id) => {
        const ids = new Set(get().bookmarkedIds);
        if (ids.has(id)) ids.delete(id);
        else ids.add(id);
        set({ bookmarkedIds: ids });
      },

      // Compare
      compareIds: [],
      toggleCompare: (id) => {
        const curr = get().compareIds;
        if (curr.includes(id)) set({ compareIds: curr.filter((c) => c !== id) });
        else if (curr.length < 3) set({ compareIds: [...curr, id] });
      },
      clearCompare: () => set({ compareIds: [] }),

      // UI
      sidebarOpen: true,
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      connectModalOpen: false,
      setConnectModalOpen: (connectModalOpen) => set({ connectModalOpen }),
    }),
    {
      name: 'nexus-storage',
      partialize: (s) => ({
        token: s.token,
        user: s.user,
        bookmarkedIds: Array.from(s.bookmarkedIds),
      }),
      onRehydrateStorage: () => (state) => {
        if (state && Array.isArray((state as any).bookmarkedIds)) {
          state.bookmarkedIds = new Set((state as any).bookmarkedIds);
        }
      },
    }
  )
);
