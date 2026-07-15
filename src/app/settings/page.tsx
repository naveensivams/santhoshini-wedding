'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, Loader2 } from 'lucide-react'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { APP_NAME, WEDDING_DATE, ADMIN_NAME } from '@/lib/constants'
import { formatDate } from '@/lib/utils'

export default function SettingsPage() {
  const router = useRouter()
  const [signingOut, setSigningOut] = useState(false)

  async function signOut() {
    setSigningOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-5 space-y-5 max-w-2xl">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Settings</h1>
            <p className="text-sm text-gray-500">Wedding details and account settings.</p>
          </div>

          <Card>
            <CardHeader><CardTitle>Wedding Details</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: 'Wedding name', value: APP_NAME },
                { label: 'Admin', value: ADMIN_NAME },
                { label: 'Wedding date', value: formatDate(WEDDING_DATE.toISOString()) },
                { label: 'App version', value: '1.0.0' },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <span className="text-sm text-gray-500">{label}</span>
                  <span className="text-sm font-medium text-gray-900">{value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Account</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-4">
                Sign out from this device. Other family members won&apos;t be affected.
              </p>
              <Button variant="destructive" onClick={signOut} disabled={signingOut}>
                {signingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
                Sign out
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Supabase Connection</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-2">Project URL</p>
              <code className="text-xs bg-gray-50 border border-gray-100 rounded px-2 py-1 block text-gray-700">
                {process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not configured'}
              </code>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
