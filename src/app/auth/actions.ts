'use server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function login(email: string, password: string) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) return { error: `Missing env vars: URL=${!!url} KEY=${!!key}` }
    const supabase = await createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }
    redirect('/dashboard')
  } catch (e) {
    const err = e as Error
    if (err.message?.includes('NEXT_REDIRECT')) throw e
    return { error: `Server error: ${err.message}` }
  }
}

export async function signup(email: string, password: string, name: string) {
  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({
    email, password,
    options: { data: { name } },
  })
  if (error) return { error: error.message }
  return { success: true }
}
