import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET - Get all FAQs
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    let query = supabase
      .from('faqs')
      .select('*')
      .eq('is_published', true)
      .order('category')
      .order('display_order')

    if (category) {
      query = query.eq('category', category)
    }

    const { data: faqs, error } = await query

    if (error) {
      console.error('Error fetching FAQs:', error)
      return NextResponse.json({ error: 'Failed to fetch FAQs' }, { status: 500 })
    }

    // Group FAQs by category
    const grouped = faqs?.reduce((acc, faq) => {
      if (!acc[faq.category]) {
        acc[faq.category] = []
      }
      acc[faq.category].push(faq)
      return acc
    }, {} as Record<string, typeof faqs>)

    // Get unique categories
    const categories = [...new Set(faqs?.map(f => f.category) || [])]

    return NextResponse.json({
      faqs,
      grouped,
      categories
    })
  } catch (error) {
    console.error('Error in FAQs GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
