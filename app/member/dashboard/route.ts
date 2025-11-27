import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.redirect(new URL('/onboarding', request.url), 307)
  }
  
  return NextResponse.redirect(new URL('/dashboard', request.url), 308)
}

export async function POST(request: NextRequest) {
  return GET(request)
}

