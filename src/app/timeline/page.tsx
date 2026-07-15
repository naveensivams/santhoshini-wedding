'use client'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import { Clock, MapPin } from 'lucide-react'
import { EVENTS } from '@/lib/constants'
import { formatDate } from '@/lib/utils'

export default function TimelinePage() {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-5">
          <h1 className="text-xl font-bold text-gray-900 mb-2">Wedding Timeline</h1>
          <p className="text-sm text-gray-500 mb-6">All events in chronological order.</p>
          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />
            <div className="space-y-6">
              {EVENTS.map((event, i) => (
                <div key={event.id} className="flex gap-4 relative">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 z-10" style={{ backgroundColor: event.color + '20' }}>
                    {event.icon}
                  </div>
                  <div className="bg-white rounded-xl border border-gray-100 p-4 flex-1 shadow-sm">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-900">{event.name}</h3>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: event.color + '20', color: event.color }}>
                        Day {i + 1}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatDate(event.date)}{event.time ? ` · ${event.time}` : ''}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{event.venue || 'Venue TBD'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
