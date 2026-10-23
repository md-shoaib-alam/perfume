export const PUBLIC_CACHE_CONTROL =
  'public, s-maxage=60, stale-while-revalidate=600';

export const publicCacheHeaders = {
  'Cache-Control': PUBLIC_CACHE_CONTROL,
};
