'use client'
import { useState } from 'react'
import { Search, Bell, Sun, Moon } from 'lucide-react'
import { Input } from '@/components/ui/input'

export default function Header() {
  const [query, setQuery] = useState('')

  return (
    <header className="h-12 border-b border-gray-100 bg-white flex items-center px-5 gap-4 shrink-0">
      <div className="flex-1 max-w-sm relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
        <Input
          className="pl-8 h-7 text-xs bg-gray-50 border-gray-100"
          placeholder="Search everything..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 bg-gray-100 px-1 rounded">⌘K</kbd>
      </div>
      <div className="flex items-center gap-1 ml-auto">
        <button className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
          <Bell className="w-4 h-4" />
        </button>
        <button className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
          <Sun className="w-4 h-4" />
        </button>
        <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-semibold">
          N
        </div>
      </div>
    </header>
  )
}
