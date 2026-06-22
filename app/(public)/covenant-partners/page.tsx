import { redirect } from 'next/navigation'

// Legacy alias — the canonical Covenant Partner page lives at /partners.
// Redirect (instead of re-exporting) so the content isn't served at two URLs.
export default function LegacyCovenantPartnersPage() {
  redirect('/partners')
}
