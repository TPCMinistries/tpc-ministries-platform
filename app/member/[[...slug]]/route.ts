import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// This catch-all route handles ALL /member/* requests and redirects them
// This prevents Next.js from showing a 404 for /member/* routes
export async function GET(
  request: NextRequest,
  { params }: { params: { slug?: string[] } }
) {
  const pathname = request.nextUrl.pathname
  
  // Route mapping for /member/* to new routes
  const memberRouteMap: Record<string, string> = {
    '/member/dashboard': '/dashboard',
    '/member/messages': '/messages',
    '/member/prayer-wall': '/prayer',
    '/member/my-prayers': '/my-prayers',
    '/member/library': '/library',
    '/member/seasons': '/seasons',
    '/member/my-assessments': '/my-assessments',
    '/member/profile': '/profile',
    '/member/events': '/events',
    '/member/my-giving': '/my-giving',
    '/member/giving': '/my-giving',
    '/member/resources': '/resources',
    '/member/member-settings': '/member-settings',
    '/member/settings': '/member-settings',
    '/member/account': '/account',
    '/member/assessments': '/my-assessments',
    '/member/content': '/content',
    '/member/give': '/give',
  }
  
  // Check if we have a mapped route
  const mappedPath = memberRouteMap[pathname]
  if (mappedPath) {
    // Check authentication
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      // Not authenticated - redirect to onboarding
      return NextResponse.redirect(new URL('/onboarding', request.url), 307)
    }
    
    // Authenticated - redirect to mapped path
    return NextResponse.redirect(new URL(mappedPath, request.url), 308)
  }
  
  // Unknown /member/* path - check auth and redirect appropriately
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    // Not authenticated - redirect to onboarding
    return NextResponse.redirect(new URL('/onboarding', request.url), 307)
  }
  
  // Authenticated but unknown path - redirect to dashboard
  return NextResponse.redirect(new URL('/dashboard', request.url), 308)
}

// Handle all HTTP methods
export async function POST(request: NextRequest) {
  return GET(request, { params: {} })
}

export async function PUT(request: NextRequest) {
  return GET(request, { params: {} })
}

export async function DELETE(request: NextRequest) {
  return GET(request, { params: {} })
}

export async function PATCH(request: NextRequest) {
  return GET(request, { params: {} })
}

