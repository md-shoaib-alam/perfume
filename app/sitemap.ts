import type { MetadataRoute } from 'next';
import { databases, APPWRITE_DATABASE_ID } from '@/lib/appwrite';
import { Query } from 'appwrite';
import { slugify } from './utils/slug';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://bakhoorbliss.in';

  // Base static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/collections`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  // Dynamic product routes fetched from Appwrite
  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    const res = await databases.listDocuments(APPWRITE_DATABASE_ID, 'products', [
      Query.limit(100),
    ]);

    if (res && res.documents) {
      productRoutes = res.documents.map((doc: any) => {
        const slug = slugify(doc.name || doc.productName || doc.$id);
        return {
          url: `${baseUrl}/products/${slug}`,
          lastModified: doc.$updatedAt ? new Date(doc.$updatedAt) : new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.8,
        };
      });
    }
  } catch (error) {
    console.warn('Error fetching dynamic products for sitemap:', error);
  }

  return [...staticRoutes, ...productRoutes];
}
