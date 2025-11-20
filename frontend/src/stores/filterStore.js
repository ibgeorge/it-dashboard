import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Global filter state shared across all pages
// Uses localStorage to persist filters across page navigation
export const useFilterStore = create(
  persist(
    (set) => ({
      filters: {
        startDate: new Date(new Date().getFullYear(), 0, 1).toISOString(),
        endDate: new Date().toISOString(),
        excludeAnomalies: true,
        maxResolutionDays: 90,
      },
      setFilters: (newFilters) => set({ filters: newFilters }),
    }),
    {
      name: 'dashboard-filters', // localStorage key
    }
  )
);
