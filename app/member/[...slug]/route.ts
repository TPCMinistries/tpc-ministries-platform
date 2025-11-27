import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string[] } }
) {
  const pathname = request.nextUrl.pathname
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.redirect(new URL('/onboarding', request.url), 307)
  }
  
  // Map other /member/* routes
  const routeMap: Record<string, string> = {
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
  
  const mappedPath = routeMap[pathname]
  if (mappedPath) {
    return NextResponse.redirect(new URL(mappedPath, request.url), 308)
  }
  
  // Unknown path - redirect to dashboard
  return NextResponse.redirect(new URL('/dashboard', request.url), 308)
}

export async function POST(request: NextRequest, { params }: { params: { slug: string[] } }) {
  return GET(request, { params })
}

export async function PUT(request: NextRequest, { params }: { params: { slug: string[] } }) {
  return GET(request, { params })
}

export async function DELETE(request: NextRequest, { params }: { params: { slug: string[] } }) {
  return GET(request, { params })
}

export async function PATCH(request: NextRequest, { params }: { params: { slug: string[] } }) {
  return GET(request, { params })
}

