'use client'
import { useState, useEffect } from 'react'
import { Loader2, Edit2 } from 'lucide-react'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { createClient } from '@/lib/supabase/client'
import { getInitials } from '@/lib/utils'
import type { Profile } from '@/types'

export default function TeamPage() {
  const [members, setMembers] = useState<(Profile & { totalTasks: number; completedTasks: number })[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient()
        const [profilesRes, tasksRes] = await Promise.all([
          supabase.from('profiles').select('*').order('created_at'),
          supabase.from('tasks').select('assigned_to, status'),
        ])
        const profiles = profilesRes.data || []
        const tasks = tasksRes.data || []

        const enriched = profiles.map(p => {
          const myTasks = tasks.filter(t => t.assigned_to === p.id)
          return {
            ...p,
            totalTasks: myTasks.length,
            completedTasks: myTasks.filter(t => t.status === 'Completed').length,
          }
        })
        setMembers(enriched)
      } finally { setLoading(false) }
    }
    load()
  }, [])

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-5 space-y-5">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Team</h1>
            <p className="text-sm text-gray-500">The people making this wedding happen.</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-40"><Loader2 className="w-6 h-6 text-emerald-500 animate-spin" /></div>
          ) : members.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-sm">No team members yet. Family members will appear here after they sign up.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {members.map(member => {
                const pct = member.totalTasks > 0 ? Math.round((member.completedTasks / member.totalTasks) * 100) : 0
                return (
                  <Card key={member.id} className="card-hover">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-semibold text-sm shrink-0">
                          {getInitials(member.name || member.email)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-900 text-sm truncate">{member.name || member.email}</p>
                            {member.role === 'admin' && <Badge variant="emerald">Admin</Badge>}
                          </div>
                          {member.phone && <p className="text-xs text-gray-400">{member.phone}</p>}
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-500">Performance</span>
                          <span className="text-xs font-semibold text-emerald-600">{pct}%</span>
                        </div>
                        <Progress value={pct} className="h-1.5" />
                        <p className="text-xs text-gray-400 mt-1.5">
                          {member.completedTasks} done · {member.totalTasks - member.completedTasks} pending · {member.totalTasks} total
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
            <p className="text-sm text-emerald-700 font-medium">💡 How to add team members</p>
            <p className="text-xs text-emerald-600 mt-1">
              Share the app link with family members and ask them to sign up at <strong>/auth/signup</strong>. They will automatically appear here. The first account created is always Admin.
            </p>
          </div>
        </main>
      </div>
    </div>
  )
}
