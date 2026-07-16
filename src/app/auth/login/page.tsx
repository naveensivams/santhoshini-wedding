'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Gem, Eye, EyeOff, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: authError } = await createClient().auth.signInWithPassword({ email, password })
    if (authError) {
      setError(authError.message === 'Invalid login credentials' ? 'Wrong email or password.' : authError.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen hero-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center mx-auto mb-4 border border-white/20">
            <Gem className="w-7 h-7 text-amber-300" />
          </div>
          <h1 className="font-display text-2xl font-bold text-white">Santhoshini&apos;s Wedding</h1>
          <p className="text-emerald-300 text-sm mt-1">Sign in to your planner</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl p-6 shadow-xl">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email" type="email" placeholder="you@example.com"
                value={email} onChange={e => setEmail(e.target.value)}
                required autoComplete="email"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password" type={showPw ? 'text' : 'password'} placeholder="••••••••"
                  value={password} onChange={e => setPassword(e.target.value)}
                  required autoComplete="current-password" className="pr-10"
                />
                <button
                  type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-600">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Sign In
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            New family member?{' '}
            <Link href="/auth/signup" className="text-emerald-600 font-medium hover:text-emerald-700">
              Create account
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-emerald-400 mt-6">
          11 November 2026 · One dashboard for everything 💍
        </p>
      </div>
    </div>
  )
}
