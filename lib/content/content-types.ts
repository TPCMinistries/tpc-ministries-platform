// Config-driven content type definitions
// Each type maps to its DB table and defines its form fields

export type FieldType =
  | 'text'
  | 'richtext'
  | 'textarea'
  | 'select'
  | 'switch'
  | 'image'
  | 'file'
  | 'video_url'
  | 'url'
  | 'tags'
  | 'date'
  | 'datetime'
  | 'number'

export interface FieldConfig {
  name: string
  label: string
  type: FieldType
  required?: boolean
  placeholder?: string
  options?: { label: string; value: string }[]
  defaultValue?: any
  group?: 'main' | 'sidebar'  // main = left column, sidebar = right column
  helpText?: string
}

export interface ContentTypeConfig {
  id: string
  label: string
  pluralLabel: string
  table: string
  titleField: string
  bodyField: string         // The field that gets the rich text editor
  bodyHtmlField?: string    // Separate HTML column (if different from body)
  formatField?: string      // Column tracking content_format
  slugField?: string
  statusField?: string
  publishedField?: string
  icon: string              // lucide icon name
  fields: FieldConfig[]
}

export const CONTENT_TYPES: ContentTypeConfig[] = [
  {
    id: 'teaching',
    label: 'Teaching',
    pluralLabel: 'Teachings',
    table: 'teachings',
    titleField: 'title',
    bodyField: 'description',
    bodyHtmlField: 'content_html',
    formatField: 'content_format',
    statusField: 'is_published',
    publishedField: 'published_at',
    icon: 'Video',
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true, group: 'main' },
      { name: 'description', label: 'Description', type: 'richtext', group: 'main' },
      { name: 'is_published', label: 'Published', type: 'switch', defaultValue: true, group: 'sidebar' },
      { name: 'is_featured', label: 'Featured', type: 'switch', defaultValue: false, group: 'sidebar' },
      { name: 'is_premium', label: 'Premium Only', type: 'switch', defaultValue: false, group: 'sidebar' },
      { name: 'author', label: 'Speaker', type: 'text', required: true, group: 'sidebar' },
      { name: 'content_type', label: 'Media Type', type: 'select', group: 'sidebar', defaultValue: 'video',
        options: [
          { label: 'Video', value: 'video' },
          { label: 'Audio', value: 'audio' },
          { label: 'Article', value: 'article' },
        ]
      },
      { name: 'content_url', label: 'Content URL', type: 'video_url', group: 'sidebar', placeholder: 'YouTube or video URL' },
      { name: 'thumbnail_url', label: 'Thumbnail', type: 'image', group: 'sidebar' },
      { name: 'duration_minutes', label: 'Duration (min)', type: 'number', group: 'sidebar' },
      { name: 'series_name', label: 'Series', type: 'text', group: 'sidebar', placeholder: 'e.g., Faith Foundations' },
    ],
  },
  {
    id: 'blog_post',
    label: 'Blog Post',
    pluralLabel: 'Blog Posts',
    table: 'blog_posts',
    titleField: 'title',
    bodyField: 'content',
    formatField: 'content_format',
    slugField: 'slug',
    statusField: 'status',
    publishedField: 'published_at',
    icon: 'BookOpen',
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true, group: 'main' },
      { name: 'slug', label: 'Slug', type: 'text', group: 'main', placeholder: 'auto-generated from title' },
      { name: 'excerpt', label: 'Excerpt', type: 'textarea', group: 'main', placeholder: 'Brief summary for listings' },
      { name: 'content', label: 'Content', type: 'richtext', group: 'main' },
      { name: 'status', label: 'Status', type: 'select', group: 'sidebar', defaultValue: 'draft',
        options: [
          { label: 'Draft', value: 'draft' },
          { label: 'Published', value: 'published' },
        ]
      },
      { name: 'category', label: 'Category', type: 'select', group: 'sidebar',
        options: [
          { label: 'Faith', value: 'faith' },
          { label: 'Ministry', value: 'ministry' },
          { label: 'Testimony', value: 'testimony' },
          { label: 'Announcement', value: 'announcement' },
          { label: 'Devotional', value: 'devotional' },
        ]
      },
      { name: 'featured_image', label: 'Featured Image', type: 'image', group: 'sidebar' },
      { name: 'tags', label: 'Tags', type: 'tags', group: 'sidebar' },
      { name: 'published_at', label: 'Publish Date', type: 'datetime', group: 'sidebar' },
    ],
  },
  {
    id: 'prophecy',
    label: 'Prophecy',
    pluralLabel: 'Prophecies',
    table: 'prophecies',
    titleField: 'title',
    bodyField: 'content',
    formatField: 'content_format',
    statusField: 'is_published',
    icon: 'Sparkles',
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true, group: 'main' },
      { name: 'content', label: 'Prophetic Word', type: 'richtext', group: 'main' },
      { name: 'summary', label: 'Summary', type: 'textarea', group: 'main', placeholder: 'Brief summary' },
      { name: 'is_published', label: 'Published', type: 'switch', defaultValue: true, group: 'sidebar' },
      { name: 'category', label: 'Category', type: 'select', group: 'sidebar',
        options: [
          { label: 'Prophetic Word', value: 'prophetic_word' },
          { label: 'Vision', value: 'vision' },
          { label: 'Dream', value: 'dream' },
          { label: 'Revelation', value: 'revelation' },
        ]
      },
      { name: 'scripture_reference', label: 'Scripture Reference', type: 'text', group: 'sidebar' },
      { name: 'tier_required', label: 'Access Tier', type: 'select', group: 'sidebar', defaultValue: 'free',
        options: [
          { label: 'Free', value: 'free' },
          { label: 'Partner', value: 'partner' },
          { label: 'Covenant', value: 'covenant' },
        ]
      },
      { name: 'media_url', label: 'Media', type: 'video_url', group: 'sidebar' },
      { name: 'thumbnail_url', label: 'Image', type: 'image', group: 'sidebar' },
    ],
  },
  {
    id: 'resource',
    label: 'Resource',
    pluralLabel: 'Resources',
    table: 'resources',
    titleField: 'title',
    bodyField: 'description',
    bodyHtmlField: 'description_html',
    statusField: 'is_published',
    icon: 'FileDown',
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true, group: 'main' },
      { name: 'description', label: 'Description', type: 'richtext', group: 'main' },
      { name: 'is_published', label: 'Published', type: 'switch', defaultValue: true, group: 'sidebar' },
      { name: 'type', label: 'Resource Type', type: 'select', group: 'sidebar', defaultValue: 'ebook',
        options: [
          { label: 'eBook', value: 'ebook' },
          { label: 'Document', value: 'document' },
          { label: 'Guide', value: 'guide' },
          { label: 'Worksheet', value: 'worksheet' },
          { label: 'Other', value: 'other' },
        ]
      },
      { name: 'file_url', label: 'File', type: 'file', group: 'sidebar' },
      { name: 'thumbnail_url', label: 'Thumbnail', type: 'image', group: 'sidebar' },
      { name: 'tier_required', label: 'Access Tier', type: 'select', group: 'sidebar', defaultValue: 'free',
        options: [
          { label: 'Free', value: 'free' },
          { label: 'Partner', value: 'partner' },
          { label: 'Covenant', value: 'covenant' },
        ]
      },
      { name: 'tags', label: 'Tags', type: 'tags', group: 'sidebar' },
    ],
  },
  {
    id: 'event',
    label: 'Event',
    pluralLabel: 'Events',
    table: 'events',
    titleField: 'title',
    bodyField: 'description',
    bodyHtmlField: 'description_html',
    statusField: 'is_published',
    icon: 'Calendar',
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true, group: 'main' },
      { name: 'description', label: 'Description', type: 'richtext', group: 'main' },
      { name: 'is_published', label: 'Published', type: 'switch', defaultValue: true, group: 'sidebar' },
      { name: 'event_type', label: 'Event Type', type: 'select', group: 'sidebar', defaultValue: 'in-person',
        options: [
          { label: 'In Person', value: 'in-person' },
          { label: 'Online', value: 'online' },
          { label: 'Hybrid', value: 'hybrid' },
        ]
      },
      { name: 'location', label: 'Location', type: 'text', group: 'sidebar' },
      { name: 'start_date', label: 'Start Date', type: 'datetime', group: 'sidebar' },
      { name: 'end_date', label: 'End Date', type: 'datetime', group: 'sidebar' },
      { name: 'image_url', label: 'Event Image', type: 'image', group: 'sidebar' },
      { name: 'capacity', label: 'Capacity', type: 'number', group: 'sidebar' },
      { name: 'tier_required', label: 'Access Tier', type: 'select', group: 'sidebar', defaultValue: 'free',
        options: [
          { label: 'Free', value: 'free' },
          { label: 'Partner', value: 'partner' },
          { label: 'Covenant', value: 'covenant' },
        ]
      },
    ],
  },
]

export function getContentType(id: string): ContentTypeConfig | undefined {
  return CONTENT_TYPES.find(t => t.id === id)
}

export function getContentTypeByTable(table: string): ContentTypeConfig | undefined {
  return CONTENT_TYPES.find(t => t.table === table)
}

// Generate a slug from title
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}
