import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://tpcministries.com'

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
