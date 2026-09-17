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
      {
        userAgent: 'Googlebot',
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
      {
        userAgent: 'Googlebot-Image',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
        ],
      },
    ],
    sitemap: 'https://bakhoorbliss.in/sitemap.xml',
    host: 'https://bakhoorbliss.in',
  };
}
