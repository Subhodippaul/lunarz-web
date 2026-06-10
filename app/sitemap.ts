import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://lunarz.in',
      lastModified: new Date(),
    },
  ]
}