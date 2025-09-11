// SRP: Hook dedicado solo al manejo de filtros
import { useState, useCallback } from 'react';

export const useCategoryFilters = (initialFilters = { min: '', max: '', brands: [] }) => {
  const [filters, setFilters] = useState(initialFilters);
  const [pendingFilters, setPendingFilters] = useState(initialFilters);
  const [sort, setSort] = useState({ by: 'rating', order: 'desc' });
  const [pendingSort, setPendingSort] = useState(sort);
  const [page, setPage] = useState(1);

  // Reset filters when category changes
  const resetFilters = useCallback(() => {
    const resetState = { min: '', max: '', brands: [] };
    setFilters(resetState);
    setPendingFilters(resetState);
    setPage(1);
  }, []);

  // ISP: Métodos específicos para cada tipo de filtro
  const updatePriceRange = useCallback((min, max) => {
    setFilters(prev => ({ ...prev, min, max }));
    setPage(1);
  }, []);

  const updateBrands = useCallback((brands) => {
    setFilters(prev => ({ ...prev, brands }));
    setPage(1);
  }, []);

  const updateSort = useCallback((newSort) => {
    setSort(newSort);
    setPage(1);
  }, []);

  const updatePendingPriceRange = useCallback((min, max) => {
    setPendingFilters(prev => ({ ...prev, min, max }));
  }, []);

  const updatePendingBrands = useCallback((brands) => {
    setPendingFilters(prev => ({ ...prev, brands }));
  }, []);

  const updatePendingSort = useCallback((newSort) => {
    setPendingSort(newSort);
  }, []);

  const applyPendingFilters = useCallback(() => {
    setFilters(pendingFilters);
    setSort(pendingSort);
    setPage(1);
  }, [pendingFilters, pendingSort]);

  const goToPage = useCallback((newPage, totalPages) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  }, []);

  return {
    filters,
    pendingFilters,
    sort,
    pendingSort,
    page,
    resetFilters,
    updatePriceRange,
    updateBrands,
    updateSort,
    updatePendingPriceRange,
    updatePendingBrands,
    updatePendingSort,
    applyPendingFilters,
    goToPage
  };
};
