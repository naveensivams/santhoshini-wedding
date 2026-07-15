'use client'
import { useState, useEffect } from 'react'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EVENTS } from '@/lib/constants'
import { createClient } from '@/lib/supabase/client'

export default function AnalyticsPage() {
  const [tasks, setTasks] = useState<{ event_id?: string; status: string }[]>([])
  const [bookings, setBookings] = useState<{ status: string }[]>([])
  const [budget, setBudget] = useState<{ type: string; amount: number }[]>([])
  const [guests, setGuests] = useState<{ rsvp_status: string }[]>([])
  const [totalBudgetSetting, setTotalBudgetSetting] = useState(0)

  useEffect(() => {
    async function load() {
      const sb = createClient()
      const [{ data: t }, { data: b }, { data: bu }, { data: g }, { data: s }] = await Promise.all([
        sb.from('tasks').select('event_id,status'),
        sb.from('bookings').select('status'),
        sb.from('budget_entries').select('type,amount'),
        sb.from('guests').select('rsvp_status'),
        sb.from('settings').select('value').eq('key', 'total_budget').maybeSingle()
      ])
      setTasks(t || []); setBookings(b || []); setBudget(bu || []); setGuests(g || [])
      setTotalBudgetSetting(parseFloat(s?.value || '0'))
    }
    load()
  }, [])

  const eventData = EVENTS.map(ev => {
    const evTasks = tasks.filter(t => t.event_id === ev.id)
    const completed = evTasks.filter(t => t.status === 'Completed').length
    return { name: ev.name, icon: ev.icon, tasks: evTasks.length, completed, pct: evTasks.length ? Math.round((completed / evTasks.length) * 100) : 0 }
  })

  const radarData = eventData.map(e => ({ subject: e.name, completion: e.pct }))
  const totalBudget = totalBudgetSetting || budget.filter(b => b.type === 'Budget').reduce((s, b) => s + b.amount, 0)
  const spent = budget.filter(b => b.type === 'Expense' || b.type === 'Advance').reduce((s, b) => s + b.amount, 0)
  const confirmedBookings = bookings.filter(b => b.status === 'Confirmed' || b.status === 'Booked').length
  const confirmedGuests = guests.filter(g => g.rsvp_status === 'Confirmed').length
  const totalTasks = tasks.length
  const completedTasks = tasks.filter(t => t.status === 'Completed').length

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-5 space-y-5">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Analytics</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Progress overview across all wedding events.</p>
          </div>

          {/* Summary row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Tasks Done', value: `${completedTasks}/${totalTasks}`, pct: totalTasks ? Math.round((completedTasks/totalTasks)*100) : 0, color: 'text-emerald-600' },
              { label: 'Budget Spent', value: `₹${spent.toLocaleString('en-IN')} / ₹${totalBudget.toLocaleString('en-IN')}`, pct: totalBudget ? Math.round((spent/totalBudget)*100) : 0, color: 'text-amber-600' },
              { label: 'Bookings Confirmed', value: `${confirmedBookings}/${bookings.length}`, pct: bookings.length ? Math.round((confirmedBookings/bookings.length)*100) : 0, color: 'text-blue-600' },
              { label: 'Guests Confirmed', value: `${confirmedGuests}/${guests.length}`, pct: guests.length ? Math.round((confirmedGuests/guests.length)*100) : 0, color: 'text-purple-600' },
            ].map(({ label, value, pct, color }) => (
              <Card key={label}>
                <CardContent className="p-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</p>
                  <p className={`text-lg font-bold ${color} mb-2`}>{value}</p>
                  <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle>Tasks by event</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={eventData}>
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="tasks" fill="#d1fae5" name="Total" radius={[4,4,0,0]} />
                    <Bar dataKey="completed" fill="#059669" name="Completed" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Completion % by event</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                    <Radar name="Completion %" dataKey="completion" stroke="#059669" fill="#059669" fillOpacity={0.25} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Per-event breakdown */}
          <Card>
            <CardHeader><CardTitle>Per-event breakdown</CardTitle></CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-50 dark:divide-gray-800">
                {eventData.map(ev => (
                  <div key={ev.name} className="flex items-center gap-3 px-5 py-3">
                    <span className="text-lg shrink-0">{ev.icon}</span>
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200 w-28 shrink-0">{ev.name}</span>
                    <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${ev.pct}%` }} />
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 w-24 text-right shrink-0">{ev.completed}/{ev.tasks} tasks · {ev.pct}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
