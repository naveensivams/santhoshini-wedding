'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Gem, Eye, EyeOff, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { data, error: authError } = await createClient().auth.signUp({
      email, password,
      options: { data: { name } },
    })
    setLoading(false)
    if (authError) { setError(authError.message); return }
    if (data.session) {
      router.push('/dashboard')
      router.refresh()
    } else {
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen hero-gradient flex items-center justify-center p-4">
        <div className="w-full max-w-sm text-center">
          <div className="bg-white rounded-2xl p-8 shadow-xl">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Gem className="w-6 h-6 text-emerald-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Check your email!</h2>
            <p className="text-sm text-gray-500 mb-4">
              We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account.
            </p>
            <p className="text-xs text-gray-400">
              Tip: If you don&apos;t see it, check spam or ask the admin to disable email confirmation in Supabase.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen hero-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center mx-auto mb-4 border border-white/20">
            <Gem className="w-7 h-7 text-amber-300" />
          </div>
          <h1 className="font-display text-2xl font-bold text-white">Join the Family</h1>
          <p className="text-emerald-300 text-sm mt-1">Create your planner account</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-xl">
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Your name</Label>
              <Input id="name" placeholder="e.g. Priya Aunty" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email address</Label>
              <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password" type={showPw ? 'text' : 'password'} placeholder="Min. 8 characters"
                  value={password} onChange={e => setPassword(e.target.value)}
                  required minLength={8} className="pr-10"
                />
                <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-600">{error}</div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Create Account
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-emerald-600 font-medium hover:text-emerald-700">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
