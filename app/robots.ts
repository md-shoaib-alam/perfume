import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/account/',
          '/checkout/',
          '/auth/',
          '/sso-callback/',
        ],
      },
    ],
    sitemap: 'https://bakhoorbliss.in/sitemap.xml',
  };
}
