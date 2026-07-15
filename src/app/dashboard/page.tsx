'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { CheckSquare, BookOpen, ShoppingCart, DollarSign, AlertTriangle, ChevronRight, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { EVENTS, WEDDING_DATE, PLANNING_START_DATE, ADMIN_NAME } from '@/lib/constants'
import { getCountdown, getPlanningProgress, formatCurrency, formatDate } from '@/lib/utils'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function CountdownBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center">
      <div className="text-2xl font-bold text-white tabular-nums">{String(value).padStart(2, '0')}</div>
      <div className="text-[10px] text-emerald-200 uppercase tracking-widest mt-0.5">{label}</div>
    </div>
  )
}

function ProgressRing({ days }: { days: number }) {
  const maxDays = 120
  const pct = Math.max(0, Math.min(100, (days / maxDays) * 100))
  const r = 52
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ
  return (
    <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="8" />
        <circle
          cx="60" cy="60" r={r} fill="none"
          stroke="#D4AF37" strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.5s ease' }}
        />
      </svg>
      <div className="text-center z-10">
        <div className="text-2xl font-bold text-white">{days}</div>
        <div className="text-[10px] text-emerald-200 uppercase tracking-wider">days left</div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [progress, setProgress] = useState(0)
  const [stats, setStats] = useState({
    totalTasks: 0, completedTasks: 0,
    totalBookings: 0, confirmedBookings: 0,
    totalShopping: 0, purchasedShopping: 0,
    totalBudget: 0, spentBudget: 0,
  })
  const [overdueBookings, setOverdueBookings] = useState<string[]>([])
  const [eventStats, setEventStats] = useState<Record<string, { done: number; total: number }>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const tick = () => {
      setCountdown(getCountdown(WEDDING_DATE))
      setProgress(getPlanningProgress(WEDDING_DATE, PLANNING_START_DATE))
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    function load() {
      try {
        const tasks = JSON.parse(localStorage.getItem('wedding_tasks')||'[]')
        const bookings = JSON.parse(localStorage.getItem('wedding_bookings')||'[]')
        const shopping = JSON.parse(localStorage.getItem('wedding_shopping')||'[]')
        const budget = JSON.parse(localStorage.getItem('wedding_budget')||'[]')
        const daysLeft = countdown.days
        const { getBookingUrgency } = require('@/lib/utils')
        const overdue = bookings
          .filter((b: {status:string}) => b.status === 'Not Booked' || b.status === 'Enquired')
          .filter((b: {category:string}) => { const u = getBookingUrgency(b.category, daysLeft); return u === 'Critical' || u === 'Overdue' })
          .map((b: {category:string}) => b.category).slice(0, 3)
        const estats: Record<string, { done: number; total: number }> = {}
        EVENTS.forEach(e => { estats[e.id] = { done: 0, total: 0 } })
        tasks.forEach((t: {event_id?:string;status:string}) => {
          if (t.event_id && estats[t.event_id]) { estats[t.event_id].total++; if (t.status === 'Completed') estats[t.event_id].done++ }
        })
        const totalBudget = budget.filter((b: {type:string}) => b.type === 'Budget').reduce((s: number, b: {amount:number}) => s + (b.amount||0), 0)
        const spentBudget = budget.filter((b: {type:string}) => b.type === 'Expense' || b.type === 'Advance').reduce((s: number, b: {amount:number}) => s + (b.amount||0), 0)
        setStats({ totalTasks: tasks.length, completedTasks: tasks.filter((t: {status:string}) => t.status === 'Completed').length, totalBookings: bookings.length, confirmedBookings: bookings.filter((b: {status:string}) => b.status === 'Confirmed' || b.status === 'Booked').length, totalShopping: shopping.length, purchasedShopping: shopping.filter((s: {status:string}) => s.status === 'Purchased').length, totalBudget, spentBudget })
        setOverdueBookings(overdue); setEventStats(estats)
      } finally { setLoading(false) }
    }
    load()
  }, [countdown.days])

  return (
    <div className="p-5 space-y-5">
      {/* Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="hero-gradient rounded-2xl p-6 relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white translate-x-20 -translate-y-20" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white -translate-x-10 translate-y-10" />
        </div>

        <div className="relative flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-emerald-300 text-sm mb-1">{getGreeting()}, {ADMIN_NAME} 🌙</p>
            <h1 className="font-display text-3xl font-bold text-white leading-tight mb-1">
              SANTHOSHINI&apos;S WEDDING
            </h1>
            <p className="text-amber-300 text-sm font-medium tracking-wide mb-4">
              11 NOVEMBER 2026 · ONE DASHBOARD FOR EVERYTHING
            </p>

            <div className="flex items-center gap-4 mb-4">
              <CountdownBox value={countdown.days} label="Days" />
              <div className="w-px h-8 bg-emerald-600" />
              <CountdownBox value={countdown.hours} label="Hours" />
              <div className="w-px h-8 bg-emerald-600" />
              <CountdownBox value={countdown.minutes} label="Min" />
              <div className="w-px h-8 bg-emerald-600" />
              <CountdownBox value={countdown.seconds} label="Sec" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-emerald-300">Planning time elapsed</span>
                <span className="text-xs text-emerald-200 font-medium">{progress}%</span>
              </div>
              <div className="w-64 h-1.5 bg-emerald-900 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                />
              </div>
            </div>
          </div>

          <ProgressRing days={countdown.days} />
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-3">
        {[
          {
            label: 'Tasks Done', icon: CheckSquare, color: 'text-emerald-600',
            value: `${stats.completedTasks}/${stats.totalTasks}`,
            pct: stats.totalTasks ? (stats.completedTasks / stats.totalTasks) * 100 : 0,
          },
          {
            label: 'Bookings Confirmed', icon: BookOpen, color: 'text-blue-600',
            value: `${stats.confirmedBookings}/${stats.totalBookings}`,
            pct: stats.totalBookings ? (stats.confirmedBookings / stats.totalBookings) * 100 : 0,
          },
          {
            label: 'Shopping Bought', icon: ShoppingCart, color: 'text-purple-600',
            value: `${stats.purchasedShopping}/${stats.totalShopping}`,
            pct: stats.totalShopping ? (stats.purchasedShopping / stats.totalShopping) * 100 : 0,
          },
          {
            label: 'Budget Used', icon: DollarSign, color: 'text-amber-600',
            value: formatCurrency(stats.spentBudget),
            pct: stats.totalBudget ? (stats.spentBudget / stats.totalBudget) * 100 : 0,
          },
        ].map(({ label, icon: Icon, color, value, pct }) => (
          <Card key={label} className="card-hover">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <div className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{value}</div>
              <Progress value={pct} className="h-1" indicatorClassName="bg-emerald-500" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Urgency Alert */}
      {overdueBookings.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5"
        >
          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
          <span className="text-sm text-red-700 font-medium">
            {overdueBookings.length} bookings past ideal booking window
          </span>
          <span className="text-sm text-red-500">— {overdueBookings.join(', ')}</span>
          <Link href="/bookings" className="ml-auto text-xs text-red-600 hover:text-red-800 font-medium flex items-center gap-1">
            View <ArrowRight className="w-3 h-3" />
          </Link>
        </motion.div>
      )}

      {/* Events Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Events</h2>
          <Link href="/events/manage" className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1">
            Manage <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {EVENTS.map(event => {
            const es = eventStats[event.id] || { done: 0, total: 0 }
            const pct = es.total > 0 ? Math.round((es.done / es.total) * 100) : 0
            return (
              <Link key={event.id} href={`/events/${event.slug}`}>
                <Card className="card-hover overflow-hidden">
                  <div className={`h-1.5 bg-gradient-to-r ${event.gradient}`} />
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0"
                        style={{ backgroundColor: event.color + '20' }}
                      >
                        {event.icon}
                      </span>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm truncate">{event.name}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">{formatDate(event.date)}{event.time ? ` · ${event.time}` : ''}</p>
                      </div>
                      <span className="ml-auto text-sm font-bold" style={{ color: event.color }}>{pct}%</span>
                    </div>
                    <Progress
                      value={pct}
                      className="h-1"
                      indicatorClassName=""
                      style={{ '--tw-bg-opacity': 1 } as React.CSSProperties}
                    />
                    <div
                      className="h-1 rounded-full mt-2 overflow-hidden bg-gray-100"
                    >
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: `linear-gradient(to right, ${event.color}99, ${event.color})` }}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">{es.done}/{es.total} tasks · {event.venue || 'Venue TBD'}</p>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
