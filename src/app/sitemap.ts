import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
  
  if (!baseUrl) {
    throw new Error('NEXT_PUBLIC_APP_URL environment variable is required for sitemap generation');
  }
  
  // Generate URLs for all 114 chapters
  const chapterUrls = Array.from({ length: 114 }, (_, i) => ({
    url: `${baseUrl}/surah/${i + 1}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/collections`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/tags`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/community-tags`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.6,
    },
    ...chapterUrls,
  ];
}
