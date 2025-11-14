import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: assessments, error } = await supabase
      .from('assessments')
      .select('id, name, slug, description, category, question_count, estimated_minutes, biblical_foundation, is_active, display_order, total_completions')
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      assessments
    }, { status: 200 })
  } catch (error) {
    console.error('Error fetching assessments:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch assessments'
      },
      { status: 500 }
    )
  }
}
