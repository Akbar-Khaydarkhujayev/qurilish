import { useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router';

interface UsePaginationOptions {
  defaultPage?: number;
  defaultLimit?: number;
  paramPageName?: string;
  paramLimitName?: string;
}

export function usePagination({
  defaultPage = 1,
  defaultLimit = 25,
  paramPageName = 'page',
  paramLimitName = 'limit',
}: UsePaginationOptions = {}) {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get(paramPageName)) || defaultPage;
  const limit = Number(searchParams.get(paramLimitName)) || defaultLimit;

  const setPage = useCallback(
    (newPage: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(paramPageName, newPage.toString());
      setSearchParams(params, { replace: true });
    },
    [searchParams, setSearchParams, paramPageName]
  );

  const setLimit = useCallback(
    (newLimit: number | string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(paramLimitName, newLimit.toString());
      params.set(paramPageName, '1');
      setSearchParams(params, { replace: true });
    },
    [searchParams, setSearchParams, paramLimitName, paramPageName]
  );

  const resetPagination = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(paramPageName);
    params.delete(paramLimitName);
    setSearchParams(params, { replace: true });
  }, [searchParams, setSearchParams, paramPageName, paramLimitName]);

  return useMemo(
    () => ({
      page,
      limit,
      setPage,
      setLimit,
      resetPagination,
    }),
    [page, limit, setPage, setLimit, resetPagination]
  );
}
