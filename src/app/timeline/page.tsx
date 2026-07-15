'use client'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import { Clock, MapPin, ShoppingBag } from 'lucide-react'
import { EVENTS } from '@/lib/constants'
import { formatDate } from '@/lib/utils'

interface ShoppingItem { id: string; name: string; store?: string; budget_amount?: number; status: string; event_id?: string; category?: string }

function getShoppingItems(): ShoppingItem[] {
  try { return JSON.parse(localStorage.getItem('wedding_shopping') || '[]') } catch { return [] }
}

export default function TimelinePage() {
  const shopping = getShoppingItems().filter(s => s.event_id)

  const eventEntries = EVENTS.map((event, i) => {
    const items = shopping.filter(s => s.event_id === event.id)
    return { type: 'event' as const, event, day: i + 1, items, date: event.date }
  })

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-5">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">Wedding Timeline</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">All events in chronological order — with linked shopping items.</p>
          <div className="relative max-w-2xl">
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-800" />
            <div className="space-y-6">
              {eventEntries.map(({ event, day, items }) => (
                <div key={event.id} className="flex gap-4 relative">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 z-10" style={{ backgroundColor: event.color + '20' }}>
                    {event.icon}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">{event.name}</h3>
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: event.color + '20', color: event.color }}>
                          Day {day}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatDate(event.date)}{event.time ? ` · ${event.time}` : ''}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{event.venue || 'TBD'}</span>
                      </div>
                    </div>

                    {items.length > 0 && (
                      <div className="ml-4 space-y-1.5">
                        {items.map(item => (
                          <div key={item.id} className="flex items-center gap-2.5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-lg px-3 py-2 shadow-sm">
                            <ShoppingBag className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                            <span className={`text-sm flex-1 ${item.status === 'Purchased' ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-800 dark:text-gray-200'}`}>{item.name}</span>
                            {item.category && <span className="text-[10px] text-gray-400 dark:text-gray-500">{item.category}</span>}
                            {item.store && <span className="text-[10px] text-purple-500">📍 {item.store}</span>}
                            {item.budget_amount && <span className="text-[10px] text-emerald-600 dark:text-emerald-400">₹{item.budget_amount.toLocaleString('en-IN')}</span>}
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${item.status === 'Purchased' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'}`}>{item.status}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {items.length === 0 && (
                      <p className="ml-4 text-[11px] text-gray-300 dark:text-gray-600 italic">No shopping items linked — add items in Shopping and select this event</p>
                    )}
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
