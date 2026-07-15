'use client'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import { CalendarDays } from 'lucide-react'

export default function CalendarPage() {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-5">
          <h1 className="text-xl font-bold text-gray-900 mb-2">Calendar</h1>
          <p className="text-sm text-gray-500 mb-8">Visual calendar of all events and deadlines.</p>
          <div className="flex items-center justify-center h-64 bg-white rounded-xl border border-gray-100">
            <div className="text-center text-gray-300">
              <CalendarDays className="w-12 h-12 mx-auto mb-3" />
              <p className="text-sm">Calendar view — coming soon</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
