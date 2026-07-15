'use client'
import { useState } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import { EVENTS } from '@/lib/constants'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'

const KEY = 'wedding_event_overrides'
function loadOverrides(): Record<string, { date?: string; time?: string; venue?: string }> {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}') } catch { return {} }
}

export default function ManageEventsPage() {
  const [overrides, setOverrides] = useState<Record<string, { date?: string; time?: string; venue?: string }>>(loadOverrides)
  const [saved, setSaved] = useState<string | null>(null)

  function update(eventId: string, field: string, value: string) {
    setOverrides(prev => ({ ...prev, [eventId]: { ...prev[eventId], [field]: value } }))
  }

  function save(eventId: string) {
    localStorage.setItem(KEY, JSON.stringify(overrides))
    setSaved(eventId)
    setTimeout(() => setSaved(null), 2000)
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-5">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Manage Events</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Update date, time and venue for each wedding event</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
            {EVENTS.map(event => {
              const ov = overrides[event.id] || {}
              return (
                <Card key={event.id} className="dark:bg-gray-900 dark:border-gray-800">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{event.icon}</span>
                      <h2 className="font-semibold text-gray-900 dark:text-gray-100">{event.name}</h2>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="dark:text-gray-300">Date</Label>
                      <Input type="date" value={ov.date || event.date} onChange={e => update(event.id, 'date', e.target.value)} className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="dark:text-gray-300">Time</Label>
                      <Input placeholder="e.g. Morning · 9:00 AM" value={ov.time ?? (event.time || '')} onChange={e => update(event.id, 'time', e.target.value)} className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="dark:text-gray-300">Venue</Label>
                      <Input placeholder="e.g. Our Home" value={ov.venue ?? (event.venue || '')} onChange={e => update(event.id, 'venue', e.target.value)} className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" />
                    </div>
                    <Button size="sm" className="w-full" onClick={() => save(event.id)}>
                      {saved === event.id ? <><Check className="w-4 h-4" /> Saved!</> : 'Save Changes'}
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </main>
      </div>
    </div>
  )
}
