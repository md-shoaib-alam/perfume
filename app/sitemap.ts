import type { MetadataRoute } from 'next';
import { databases, APPWRITE_DATABASE_ID } from '@/lib/appwrite';
import { Query } from 'appwrite';
import { slugify } from './utils/slug';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://bakhoorbliss.in';
  const now = new Date();

  // 1. Core Static & Marketing Routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/terms-of-service`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // 2. All Collection & Catalog Category Routes
  const staticCollections = [
    'all',
    'for-him',
    'for-her',
    'unisex',
    'extrait-de-parfum',
    'attar',
    'discovery-set',
    'gift-set',
    'travel-set',
    'bureau',
    'luxe',
    'haute',
    'miss_neesh',
  ];

  const collectionRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/collections`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...staticCollections.map((slug) => ({
      url: `${baseUrl}/collections/${slug}`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: slug === 'all' ? 0.95 : 0.85,
    })),
  ];

  // 3. Dynamic Collections from Appwrite Database (perfumedb -> collections)
  let dynamicCollectionRoutes: MetadataRoute.Sitemap = [];
  try {
    const collectionsRes = await databases.listDocuments(APPWRITE_DATABASE_ID, 'collections', [
      Query.limit(100),
    ]);

    if (collectionsRes?.documents) {
      dynamicCollectionRoutes = collectionsRes.documents
        .filter((col: any) => col.slug && !staticCollections.includes(col.slug))
        .map((col: any) => ({
          url: `${baseUrl}/collections/${col.slug}`,
          lastModified: col.$updatedAt ? new Date(col.$updatedAt) : now,
          changeFrequency: 'weekly' as const,
          priority: 0.8,
        }));
    }
  } catch (error) {
    console.warn('Error fetching dynamic collections for sitemap:', error);
  }

  // 4. Dynamic Product Routes from Appwrite Database (perfumedb -> products)
  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    let offset = 0;
    const limit = 100;
    let hasMore = true;

    while (hasMore) {
      const res = await databases.listDocuments(APPWRITE_DATABASE_ID, 'products', [
        Query.limit(limit),
        Query.offset(offset),
      ]);

      if (res?.documents && res.documents.length > 0) {
        for (const doc of res.documents) {
          const slug = slugify(doc.name || doc.productName || doc.$id);
          if (slug) {
            productRoutes.push({
              url: `${baseUrl}/products/${slug}`,
              lastModified: doc.$updatedAt ? new Date(doc.$updatedAt) : now,
              changeFrequency: 'weekly' as const,
              priority: 0.8,
            });
          }
        }
        offset += res.documents.length;
        if (res.documents.length < limit || offset >= (res.total || 0)) {
          hasMore = false;
        }
      } else {
        hasMore = false;
      }
    }
  } catch (error) {
    console.warn('Error fetching dynamic products for sitemap:', error);
  }

  return [
    ...staticRoutes,
    ...collectionRoutes,
    ...dynamicCollectionRoutes,
    ...productRoutes,
  ];
}
