'use client'
import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EVENTS } from '@/lib/constants'
import { createClient } from '@/lib/supabase/client'

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [eventData, setEventData] = useState<{ name: string; tasks: number; completed: number; pct: number }[]>([])

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient()
        const { data: tasks } = await supabase.from('tasks').select('event_id, status')
        const result = EVENTS.map(ev => {
          const evTasks = (tasks || []).filter(t => t.event_id === ev.id)
          const completed = evTasks.filter(t => t.status === 'Completed').length
          return { name: ev.name, tasks: evTasks.length, completed, pct: evTasks.length ? Math.round((completed / evTasks.length) * 100) : 0 }
        }).filter(e => e.tasks > 0)
        setEventData(result)
      } finally { setLoading(false) }
    }
    load()
  }, [])

  const radarData = eventData.map(e => ({ subject: e.name, completion: e.pct }))

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-5 space-y-5">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Analytics</h1>
            <p className="text-sm text-gray-500">Progress overview across all wedding events.</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-40"><Loader2 className="w-6 h-6 text-emerald-500 animate-spin" /></div>
          ) : eventData.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-12">Add tasks to see analytics data here.</p>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader><CardTitle>Task completion by event</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={eventData}>
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="tasks" fill="#d1fae5" name="Total" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="completed" fill="#059669" name="Completed" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              {radarData.length >= 3 && (
                <Card>
                  <CardHeader><CardTitle>Completion radar</CardTitle></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={260}>
                      <RadarChart data={radarData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                        <Radar name="Completion %" dataKey="completion" stroke="#059669" fill="#059669" fillOpacity={0.2} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
