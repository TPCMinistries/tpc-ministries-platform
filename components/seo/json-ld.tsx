/**
 * JSON-LD Schema Components for SEO
 * Provides structured data for search engines
 */

// Base URL for the site
const BASE_URL = process.env.NEXT_PUBLIC_URL || 'https://tpcministries.org'

// Organization Schema - Used site-wide
export function OrganizationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${BASE_URL}/#organization`,
    name: 'TPC Ministries',
    url: BASE_URL,
    logo: {
      '@type': 'ImageObject',
      url: `${BASE_URL}/icons/icon-512x512.png`,
      width: 512,
      height: 512
    },
    description: 'Transforming Lives Through Christ - A prophetic ministry serving communities across Kenya, South Africa, and Grenada.',
    foundingDate: '2020',
    sameAs: [
      'https://www.facebook.com/tpcministries',
      'https://www.youtube.com/@tpcministries',
      'https://www.instagram.com/tpcministries'
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: 'info@tpcministries.org',
      availableLanguage: 'English'
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

// Church Schema - For local presence
export function ChurchSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Church',
    '@id': `${BASE_URL}/#church`,
    name: 'TPC Ministries',
    url: BASE_URL,
    logo: `${BASE_URL}/icons/icon-512x512.png`,
    description: 'A prophetic ministry focused on discipleship, spiritual growth, and global missions.',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'US'
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Sunday',
        opens: '10:00',
        closes: '12:00'
      }
    ]
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

// Article Schema - For blog posts
interface ArticleSchemaProps {
  title: string
  description: string
  url: string
  imageUrl?: string
  authorName: string
  publishedAt: string
  modifiedAt?: string
}

export function ArticleSchema({
  title,
  description,
  url,
  imageUrl,
  authorName,
  publishedAt,
  modifiedAt
}: ArticleSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: description,
    url: url,
    image: imageUrl || `${BASE_URL}/og-image.png`,
    author: {
      '@type': 'Person',
      name: authorName
    },
    publisher: {
      '@type': 'Organization',
      name: 'TPC Ministries',
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/icons/icon-512x512.png`
      }
    },
    datePublished: publishedAt,
    dateModified: modifiedAt || publishedAt,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

// FAQ Page Schema
interface FAQ {
  question: string
  answer: string
}

interface FAQPageSchemaProps {
  faqs: FAQ[]
}

export function FAQPageSchema({ faqs }: FAQPageSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

// Breadcrumb Schema
interface BreadcrumbItem {
  name: string
  url: string
}

interface BreadcrumbSchemaProps {
  items: BreadcrumbItem[]
}

export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

// Event Schema - For ministry events
interface EventSchemaProps {
  name: string
  description: string
  startDate: string
  endDate?: string
  location?: string
  url: string
  imageUrl?: string
  isOnline?: boolean
}

export function EventSchema({
  name,
  description,
  startDate,
  endDate,
  location,
  url,
  imageUrl,
  isOnline = false
}: EventSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: name,
    description: description,
    startDate: startDate,
    endDate: endDate || startDate,
    url: url,
    image: imageUrl || `${BASE_URL}/og-image.png`,
    eventAttendanceMode: isOnline
      ? 'https://schema.org/OnlineEventAttendanceMode'
      : 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    location: isOnline
      ? {
          '@type': 'VirtualLocation',
          url: url
        }
      : {
          '@type': 'Place',
          name: location || 'TPC Ministries',
          address: {
            '@type': 'PostalAddress',
            addressCountry: 'US'
          }
        },
    organizer: {
      '@type': 'Organization',
      name: 'TPC Ministries',
      url: BASE_URL
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

// Video Schema - For teachings
interface VideoSchemaProps {
  name: string
  description: string
  thumbnailUrl?: string
  uploadDate: string
  duration?: string // ISO 8601 format (e.g., "PT1H30M")
  contentUrl?: string
  embedUrl?: string
}

export function VideoSchema({
  name,
  description,
  thumbnailUrl,
  uploadDate,
  duration,
  contentUrl,
  embedUrl
}: VideoSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: name,
    description: description,
    thumbnailUrl: thumbnailUrl || `${BASE_URL}/og-image.png`,
    uploadDate: uploadDate,
    duration: duration,
    contentUrl: contentUrl,
    embedUrl: embedUrl,
    publisher: {
      '@type': 'Organization',
      name: 'TPC Ministries',
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/icons/icon-512x512.png`
      }
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

// WebPage Schema - Generic page schema
interface WebPageSchemaProps {
  title: string
  description: string
  url: string
}

export function WebPageSchema({ title, description, url }: WebPageSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    description: description,
    url: url,
    isPartOf: {
      '@type': 'WebSite',
      name: 'TPC Ministries',
      url: BASE_URL
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

// WebSite Schema with SearchAction
export function WebSiteSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${BASE_URL}/#website`,
    name: 'TPC Ministries',
    url: BASE_URL,
    description: 'Transforming Lives Through Christ',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BASE_URL}/teachings?search={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
