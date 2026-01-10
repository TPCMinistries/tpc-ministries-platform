import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET - Get service times and locations
export async function GET() {
  try {
    const supabase = await createClient()

    // Fetch service times
    const { data: serviceTimes, error: timesError } = await supabase
      .from('service_times')
      .select('*')
      .eq('is_active', true)
      .order('display_order')

    if (timesError) {
      console.error('Error fetching service times:', timesError)
    }

    // Fetch locations
    const { data: locations, error: locationsError } = await supabase
      .from('church_locations')
      .select('*')
      .eq('is_active', true)
      .order('is_primary', { ascending: false })

    if (locationsError) {
      console.error('Error fetching locations:', locationsError)
    }

    // Fetch FAQs for visiting category
    const { data: faqs, error: faqsError } = await supabase
      .from('faqs')
      .select('*')
      .eq('is_published', true)
      .in('category', ['visiting', 'general'])
      .order('display_order')

    if (faqsError) {
      console.error('Error fetching FAQs:', faqsError)
    }

    return NextResponse.json({
      serviceTimes: serviceTimes || [],
      locations: locations || [],
      faqs: faqs || []
    })
  } catch (error) {
    console.error('Error in service-times GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
