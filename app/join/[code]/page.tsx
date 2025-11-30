'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, CheckCircle, XCircle, Sparkles } from 'lucide-react'
import { signUp } from '@/lib/auth'

interface InviteData {
  code: string
  name?: string
  email?: string
  role?: string
}

export default function JoinPage() {
  const params = useParams()
  const router = useRouter()
  const code = params.code as string

  const [validating, setValidating] = useState(true)
  const [inviteValid, setInviteValid] = useState(false)
  const [inviteData, setInviteData] = useState<InviteData | null>(null)
  const [inviteError, setInviteError] = useState<string | null>(null)

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  // Validate invite code on mount
  useEffect(() => {
    const validateCode = async () => {
      try {
        const response = await fetch(`/api/invites/validate?code=${code}`)
        const data = await response.json()

        if (data.valid) {
          setInviteValid(true)
          setInviteData(data.invite)
          // Pre-fill fields if available
          if (data.invite.name) setFullName(data.invite.name)
          if (data.invite.email) setEmail(data.invite.email)
        } else {
          setInviteError(data.error || 'Invalid invite code')
        }
      } catch (err) {
        setInviteError('Failed to validate invite code')
      } finally {
        setValidating(false)
      }
    }

    if (code) {
      validateCode()
    }
  }, [code])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    // Validate password length
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    try {
      const { error: signUpError } = await signUp(email, password, fullName)

      if (signUpError) {
        setError(signUpError.message)
        setLoading(false)
        return
      }

      // Mark invite as used
      await fetch('/api/invites/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })

      // Store invite code in session for welcome page
      sessionStorage.setItem('invite_code', code)
      sessionStorage.setItem('invite_name', fullName)

      setSuccess(true)
      setLoading(false)
    } catch (err: any) {
      setError(err.message || 'Failed to create account')
      setLoading(false)
    }
  }

  // Loading state while validating
  if (validating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-navy via-navy/95 to-navy/90 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <Loader2 className="h-12 w-12 animate-spin text-navy" />
            <p className="text-gray-600">Validating your invitation...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Invalid invite
  if (!inviteValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-navy via-navy/95 to-navy/90 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl text-navy">Invalid Invitation</CardTitle>
            <CardDescription className="text-gray-600">{inviteError}</CardDescription>
          </CardHeader>
          <CardFooter className="flex flex-col gap-4">
            <p className="text-center text-sm text-gray-600">
              If you believe this is an error, please contact the person who invited you.
            </p>
            <Link href="/auth/login" className="w-full">
              <Button variant="outline" className="w-full">
                Go to Login
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-navy via-navy/95 to-navy/90 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-navy">Check Your Email!</CardTitle>
            <CardDescription className="text-gray-600">
              We've sent a confirmation link to <strong>{email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">Next Steps:</h4>
              <ol className="text-sm text-blue-700 space-y-2 list-decimal list-inside">
                <li>Check your email inbox (and spam folder)</li>
                <li>Click the confirmation link</li>
                <li>Return here to log in and explore!</li>
              </ol>
            </div>
          </CardContent>
          <CardFooter>
            <Link href="/auth/login" className="w-full">
              <Button className="w-full bg-navy hover:bg-navy/90 text-white">
                Go to Login
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // Signup form
  return (
    <div className="min-h-screen bg-gradient-to-br from-navy via-navy/95 to-navy/90 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/95 backdrop-blur">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-2 h-12 w-12 rounded-full bg-gold/20 flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-gold" />
          </div>
          <CardTitle className="text-2xl font-bold text-navy">You're Invited!</CardTitle>
          <CardDescription className="text-gray-600">
            Join TPC Ministries and start your journey of faith
          </CardDescription>
          {inviteData?.name && (
            <p className="text-sm text-navy font-medium mt-2">
              Welcome, {inviteData.name}!
            </p>
          )}
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                disabled={loading}
                className="border-gray-300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading || !!inviteData?.email}
                className="border-gray-300"
              />
              {inviteData?.email && (
                <p className="text-xs text-gray-500">
                  This email was specified in your invitation
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Create Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="border-gray-300"
              />
              <p className="text-xs text-gray-500">Must be at least 6 characters</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
                className="border-gray-300"
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full bg-navy hover:bg-navy/90 text-white"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating your account...
                </>
              ) : (
                'Join TPC Ministries'
              )}
            </Button>

            <div className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                href="/auth/login"
                className="text-navy hover:text-gold font-semibold transition-colors"
              >
                Sign in
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
