import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function MemberRouteRedirect({
  params,
}: {
  params: { slug: string[] }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }
  
  // Map routes
  const pathname = `/member/${params.slug.join('/')}`
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
    redirect(mappedPath)
  }
  
  // Unknown path - redirect to dashboard
  redirect('/dashboard')
}

