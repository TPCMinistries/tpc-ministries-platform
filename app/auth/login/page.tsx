'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { data, error } = await signIn(email, password)

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      // Redirect to onboarding - middleware will handle routing to correct dashboard
      // if member record already exists
      window.location.href = '/onboarding'
    }
  }

  return (
    <Card className="w-full max-w-md bg-white/95 backdrop-blur">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-navy">Welcome Back</CardTitle>
        <CardDescription className="text-gray-600">
          Sign in to your TPC Ministries account
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="border-gray-300"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
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
          </div>

          <div className="flex items-center justify-end">
            <Link
              href="/auth/forgot-password"
              className="text-sm text-navy hover:text-gold transition-colors"
            >
              Forgot password?
            </Link>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <Button
            type="submit"
            className="w-full bg-navy hover:bg-navy/90 text-white"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>

          <div className="text-center text-sm text-gray-600">
            Don&apos;t have an account?{' '}
            <Link href="/auth/signup" className="text-navy hover:text-gold font-semibold transition-colors">
              Sign up
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}
