'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { EVENTS, WEDDING_DATE } from '@/lib/constants'
import { getCountdown } from '@/lib/utils'
import { useSidebar } from './SidebarContext'
import {
  LayoutDashboard, CheckSquare, Calendar, ShoppingCart,
  DollarSign, Users, Store, UserCheck, CalendarDays,
  BarChart3, Settings, Plus, ChevronDown, ChevronUp,
  Gem, BookOpen, List, X
} from 'lucide-react'

const planningLinks = [
  { href: '/tasks', label: 'Tasks', icon: CheckSquare },
  { href: '/bookings', label: 'Bookings', icon: BookOpen },
  { href: '/todo', label: 'To-Do Lists', icon: List },
  { href: '/shopping', label: 'Shopping', icon: ShoppingCart },
  { href: '/budget', label: 'Budget', icon: DollarSign },
  { href: '/vendors', label: 'Vendors', icon: Store },
  { href: '/guests', label: 'Guests', icon: Users },
  { href: '/team', label: 'Team', icon: UserCheck },
  { href: '/calendar', label: 'Calendar', icon: CalendarDays },
  { href: '/timeline', label: 'Timeline', icon: Calendar },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/settings', label: 'Settings', icon: Settings },
]

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()
  const [eventsOpen, setEventsOpen] = useState(true)
  const [days, setDays] = useState(0)

  useEffect(() => {
    const update = () => { const { days } = getCountdown(WEDDING_DATE); setDays(days) }
    update()
    const interval = setInterval(update, 60000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center shrink-0">
            <Gem className="w-4 h-4 text-amber-300" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wide leading-tight truncate">Santhoshini&apos;s Wedding</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest">Planner</p>
          </div>
          {onClose && (
            <button onClick={onClose} className="md:hidden p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-900/30 rounded-lg px-3 py-1.5 text-center">
          <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">{days}</span>
          <span className="text-xs text-emerald-600 dark:text-emerald-500 ml-1">days to go</span>
        </div>
      </div>

      {/* Scrollable nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {/* Dashboard */}
        <Link
          href="/dashboard"
          className={cn(
            'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors mb-1',
            pathname === '/dashboard'
              ? 'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
          )}
        >
          <LayoutDashboard className="w-4 h-4 shrink-0" />
          Dashboard
        </Link>

        {/* Events Section */}
        <div className="mt-3 mb-1">
          <button
            onClick={() => setEventsOpen(v => !v)}
            className="w-full flex items-center justify-between px-3 py-1 text-[10px] font-semibold text-gray-400 uppercase tracking-widest hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            Events
            {eventsOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {eventsOpen && (
            <div className="mt-1 space-y-0.5">
              {EVENTS.map(event => {
                const isActive = pathname === `/events/${event.slug}`
                return (
                  <Link
                    key={event.id}
                    href={`/events/${event.slug}`}
                    className={cn(
                      'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors',
                      isActive
                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-medium'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
                    )}
                  >
                    <span
                      className="w-5 h-5 rounded-md flex items-center justify-center text-xs shrink-0"
                      style={{ backgroundColor: event.color + '20', color: event.color }}
                    >
                      {event.icon}
                    </span>
                    {event.name}
                  </Link>
                )
              })}
              <Link
                href="/events/manage"
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <Plus className="w-4 h-4 shrink-0" />
                Manage Events
              </Link>
            </div>
          )}
        </div>

        {/* Planning Section */}
        <div className="mt-4">
          <p className="px-3 py-1 text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Planning</p>
          <div className="space-y-0.5">
            {planningLinks.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors',
                    isActive
                      ? 'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 font-medium'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {label}
                </Link>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Bottom user avatar */}
      <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-semibold shrink-0">
            N
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">NaveenMS</p>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400">Admin</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Sidebar() {
  const { open, close } = useSidebar()
  return (
    <>
      {/* Mobile overlay drawer */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={close} />
          <aside className="absolute left-0 top-0 h-full w-64 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 shadow-xl">
            <SidebarContent onClose={close} />
          </aside>
        </div>
      )}
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 shrink-0 h-screen bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex-col overflow-hidden">
        <SidebarContent />
      </aside>
    </>
  )
}
