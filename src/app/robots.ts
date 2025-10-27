import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
  
  if (!baseUrl) {
    throw new Error('NEXT_PUBLIC_APP_URL environment variable is required for robots.txt generation');
  }
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/auth/signin', '/auth/signup'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
