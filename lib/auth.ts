import { createClient } from './supabase/client'

export async function signUp(email: string, password: string, fullName: string) {
  const supabase = createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
      emailRedirectTo: `${window.location.origin}/api/auth/callback?next=/onboarding`,
    },
  })

  // Send welcome email if signup successful
  if (data.user && !error) {
    try {
      await fetch('/api/notifications/welcome-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName,
          email: email,
          userId: data.user.id,
        }),
      })
    } catch (emailError) {
      // Don't fail signup if email fails
      console.warn('Welcome email failed:', emailError)
    }
  }

  return { data, error }
}

export async function signIn(email: string, password: string) {
  const supabase = createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  return { data, error }
}

export async function signOut() {
  const supabase = createClient()
  const { error } = await supabase.auth.signOut()
  return { error }
}

export async function resetPassword(email: string) {
  const supabase = createClient()

  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  })

  return { data, error }
}

export async function updatePassword(newPassword: string) {
  const supabase = createClient()

  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  })

  return { data, error }
}

export async function getUser() {
  const supabase = createClient()

  const { data: { user }, error } = await supabase.auth.getUser()

  return { user, error }
}
