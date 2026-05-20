import { MetadataRoute } from 'next'
import { getBaseUrl } from '@/lib/base-url'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl()

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/teachings',
          '/assessments',
          '/missions',
          '/prophecy',
          '/partner',
        ],
        disallow: [
          '/member/',
          '/admin/',
          '/api/',
          '/auth/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
