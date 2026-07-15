'use client'
import { useState } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { EVENTS } from '@/lib/constants'
import type { Task } from '@/types'

function getTasks(): Task[] { try { return JSON.parse(localStorage.getItem('wedding_tasks')||'[]') } catch { return [] } }

const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

export default function CalendarPage() {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const tasks = getTasks()

  function prev() { if (month === 0) { setMonth(11); setYear(y => y-1) } else setMonth(m => m-1) }
  function next() { if (month === 11) { setMonth(0); setYear(y => y+1) } else setMonth(m => m+1) }

  function getEventsForDay(day: number) {
    const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
    return EVENTS.filter(e => e.date === dateStr)
  }
  function getTasksForDay(day: number) {
    const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
    return tasks.filter(t => t.due_date === dateStr)
  }

  const cells = Array.from({ length: firstDay }, (_, i) => ({ day: 0, key: `e${i}` }))
    .concat(Array.from({ length: daysInMonth }, (_, i) => ({ day: i+1, key: `d${i+1}` })))

  const isToday = (d: number) => d === today.getDate() && month === today.getMonth() && year === today.getFullYear()

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-5">
          <div className="flex items-center justify-between mb-5">
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Calendar</h1>
            <div className="flex items-center gap-2">
              <button onClick={prev} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"><ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" /></button>
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 w-36 text-center">{MONTHS[month]} {year}</span>
              <button onClick={next} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"><ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" /></button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="grid grid-cols-7 border-b border-gray-100 dark:border-gray-800">
              {DAYS.map(d => <div key={d} className="py-2 text-center text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{d}</div>)}
            </div>
            <div className="grid grid-cols-7">
              {cells.map(({ day, key }) => {
                if (!day) return <div key={key} className="min-h-24 border-b border-r border-gray-50 dark:border-gray-800/50" />
                const evs = getEventsForDay(day)
                const tks = getTasksForDay(day)
                return (
                  <div key={key} className={`min-h-24 p-1.5 border-b border-r border-gray-50 dark:border-gray-800/50 ${isToday(day) ? 'bg-emerald-50 dark:bg-emerald-900/20' : ''}`}>
                    <span className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full mb-1 ${isToday(day) ? 'bg-emerald-600 text-white' : 'text-gray-600 dark:text-gray-400'}`}>{day}</span>
                    <div className="space-y-0.5">
                      {evs.map(ev => (
                        <div key={ev.id} className="text-[10px] px-1.5 py-0.5 rounded font-medium truncate" style={{ backgroundColor: ev.color+'20', color: ev.color }}>
                          {ev.icon} {ev.name}
                        </div>
                      ))}
                      {tks.slice(0,2).map(t => (
                        <div key={t.id} className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 truncate">
                          📌 {t.title}
                        </div>
                      ))}
                      {tks.length > 2 && <div className="text-[10px] text-gray-400">+{tks.length-2} more</div>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {EVENTS.map(ev => (
              <div key={ev.id} className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-full" style={{ backgroundColor: ev.color+'15', color: ev.color }}>
                {ev.icon} {ev.name} — {ev.date}
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}
