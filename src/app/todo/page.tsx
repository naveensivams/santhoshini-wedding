'use client'
import { useState, useEffect } from 'react'
import { Plus, Loader2, Trash2, CheckSquare, Square } from 'lucide-react'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
interface TodoItem { id: string; text: string; done: boolean; created_at: string }

export default function TodoPage() {
  const [todos, setTodos] = useState<TodoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [newText, setNewText] = useState('')
  const [adding, setAdding] = useState(false)

  async function load() {
    const { data } = await createClient().from('todo_items').select('*').order('created_at', { ascending: false })
    setTodos((data || []) as TodoItem[]); setLoading(false)
  }
  async function add() {
    if (!newText.trim()) return
    setAdding(true)
    await createClient().from('todo_items').insert({ id: crypto.randomUUID(), text: newText.trim(), done: false })
    setNewText(''); setAdding(false); load()
  }
  async function toggle(todo: TodoItem) { await createClient().from('todo_items').update({ done: !todo.done }).eq('id', todo.id); load() }
  async function remove(id: string) { await createClient().from('todo_items').delete().eq('id', id); load() }

  useEffect(() => {
    load()
    const sb = createClient()
    const sub = sb.channel('todos-ch').on('postgres_changes', { event: '*', schema: 'public', table: 'todo_items' }, load).subscribe()
    return () => { sub.unsubscribe() }
  }, [])

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-5 space-y-5 max-w-2xl">
          <h1 className="text-xl font-bold text-gray-900">Quick To-Do</h1>

          <div className="flex gap-2">
            <Input value={newText} onChange={e => setNewText(e.target.value)} placeholder="Add a quick to-do..." onKeyDown={e => e.key === 'Enter' && add()} className="flex-1" />
            <Button onClick={add} disabled={adding || !newText.trim()}>
              {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Add
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-20"><Loader2 className="w-5 h-5 text-emerald-500 animate-spin" /></div>
          ) : todos.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No to-dos yet!</p>
          ) : (
            <div className="space-y-2">
              {todos.map(todo => (
                <Card key={todo.id} className={todo.done ? 'opacity-60' : ''}>
                  <CardContent className="p-3 flex items-center gap-3">
                    <button onClick={() => toggle(todo)} className={`shrink-0 ${todo.done ? 'text-emerald-500' : 'text-gray-300 hover:text-emerald-400'}`}>
                      {todo.done ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                    </button>
                    <span className={`text-sm flex-1 ${todo.done ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-gray-100'}`}>{todo.text}</span>
                    <button onClick={() => remove(todo.id)} className="p-1 text-gray-300 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
