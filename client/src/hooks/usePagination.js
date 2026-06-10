import { useState, useCallback } from 'react';

export const usePagination = (defaultPageSize = 10) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  const goToPage = useCallback((page) => setCurrentPage(page), []);
  const nextPage = useCallback(() => setCurrentPage((p) => p + 1), []);
  const prevPage = useCallback(() => setCurrentPage((p) => Math.max(1, p - 1)), []);
  const changePageSize = useCallback((size) => { setPageSize(size); setCurrentPage(1); }, []);
  const reset = useCallback(() => setCurrentPage(1), []);

  return { currentPage, pageSize, goToPage, nextPage, prevPage, changePageSize, reset };
};
