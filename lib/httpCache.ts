export const PUBLIC_CACHE_CONTROL =
  'public, s-maxage=60, stale-while-revalidate=600';

export const publicCacheHeaders = {
  'Cache-Control': PUBLIC_CACHE_CONTROL,
};

export const shortPublicCacheHeaders = {
  'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=300',
};

export const noStoreHeaders = {
  'Cache-Control': 'no-store, max-age=0',
};
