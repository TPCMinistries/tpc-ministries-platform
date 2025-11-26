import { redirect } from 'next/navigation'

// Server-side redirect - this should never be reached if middleware works,
// but serves as a fallback
export default function MemberDashboardRedirect() {
  redirect('/dashboard')
}

