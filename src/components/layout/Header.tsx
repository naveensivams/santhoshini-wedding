'use client'
import { useState, useEffect } from 'react'
import { Search, Bell, Sun, Moon, Menu } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useSidebar } from './SidebarContext'

export default function Header() {
  const [query, setQuery] = useState('')
  const [dark, setDark] = useState(false)
  const { toggle } = useSidebar()

  useEffect(() => {
    const saved = localStorage.getItem('theme')
    if (saved === 'dark') { setDark(true); document.documentElement.classList.add('dark') }
  }, [])

  function toggleTheme() {
    const next = !dark
    setDark(next)
    if (next) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  return (
    <header className="h-12 border-b border-gray-100 bg-white dark:bg-gray-900 dark:border-gray-800 flex items-center px-3 md:px-5 gap-2 md:gap-4 shrink-0">
      <button onClick={toggle} className="md:hidden p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
        <Menu className="w-5 h-5" />
      </button>
      <div className="flex-1 max-w-sm relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
        <Input
          className="pl-8 h-7 text-xs bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
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
        <button
          onClick={toggleTheme}
          className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
        <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-semibold">
          N
        </div>
      </div>
    </header>
  )
}
