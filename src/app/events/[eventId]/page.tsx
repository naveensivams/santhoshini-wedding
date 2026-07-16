'use client'
import { useState, useEffect, use } from 'react'
import { notFound } from 'next/navigation'
import { motion } from 'framer-motion'
import { Plus, LayoutGrid, List, Table2, BookOpen, ShoppingCart, DollarSign, FileText, Loader2, Trash2, Edit2 } from 'lucide-react'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { EVENTS, TASK_PRIORITIES, TASK_STATUSES, TASK_CATEGORIES } from '@/lib/constants'
import { formatDate, getStatusColor, getPriorityColor } from '@/lib/utils'
import type { Task } from '@/types'
import { createClient } from '@/lib/supabase/client'

const STATUS_COLS = ['Not Started', 'In Progress', 'Waiting', 'Blocked', 'Completed']

function TaskCard({ task, onEdit, onDelete }: { task: Task; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow group">
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-sm font-medium text-gray-900 leading-tight">{task.title}</p>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button onClick={onEdit} className="p-1 text-gray-400 hover:text-gray-600 rounded"><Edit2 className="w-3 h-3" /></button>
          <button onClick={onDelete} className="p-1 text-gray-400 hover:text-red-500 rounded"><Trash2 className="w-3 h-3" /></button>
        </div>
      </div>
      {task.category && <p className="text-xs text-gray-400 mb-2">{task.category}</p>}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium ${getPriorityColor(task.priority)}`}>
          {task.priority}
        </span>
        {task.due_date && (
          <span className="text-[10px] text-gray-400 border border-gray-100 px-1.5 py-0.5 rounded-full">
            {formatDate(task.due_date)}
          </span>
        )}
      </div>
    </div>
  )
}

function KanbanBoard({ tasks, onEdit, onDelete }: { tasks: Task[]; onEdit: (t: Task) => void; onDelete: (id: string) => void }) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-4">
      {STATUS_COLS.map(status => {
        const col = tasks.filter(t => t.status === status)
        return (
          <div key={status} className="flex-shrink-0 w-64">
            <div className="flex items-center gap-2 mb-2">
              <span className={`w-2 h-2 rounded-full ${status === 'Completed' ? 'bg-green-500' : status === 'In Progress' ? 'bg-blue-500' : status === 'Blocked' ? 'bg-red-500' : status === 'Waiting' ? 'bg-yellow-500' : 'bg-gray-300'}`} />
              <span className="text-xs font-medium text-gray-600">{status}</span>
              <span className="text-[10px] text-gray-400 ml-auto bg-gray-100 px-1.5 py-0.5 rounded-full">{col.length}</span>
            </div>
            <div className="space-y-2 min-h-16">
              {col.map(task => (
                <TaskCard key={task.id} task={task} onEdit={() => onEdit(task)} onDelete={() => onDelete(task.id)} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function TaskForm({ event, task, onClose, onSaved }: { event: typeof EVENTS[0]; task?: Task | null; onClose: () => void; onSaved: () => void }) {
  const [title, setTitle] = useState(task?.title || '')
  const [description, setDescription] = useState(task?.description || '')
  const [category, setCategory] = useState(task?.category || '')
  const [priority, setPriority] = useState<string>(task?.priority || 'Medium')
  const [status, setStatus] = useState<string>(task?.status || 'Not Started')
  const [dueDate, setDueDate] = useState(task?.due_date || '')
  const [saving, setSaving] = useState(false)

  async function save() {
    if (!title.trim()) return
    setSaving(true)
    const payload = { title: title.trim(), description: description||null, category: category||null, priority, status, due_date: dueDate||null, event_id: event.id, completion_percent: status === 'Completed' ? 100 : 0 }
    const sb = createClient()
    const { error } = task?.id
      ? await sb.from('tasks').update(payload).eq('id', task.id)
      : await sb.from('tasks').insert({ ...payload, id: crypto.randomUUID() })
    setSaving(false)
    if (error) { console.error('Save task:', error.message, error.code); return }
    onSaved()
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{task ? 'Edit Task' : 'Add Task'}</DialogTitle>
      </DialogHeader>
      <DialogBody className="space-y-3">
        <div className="space-y-1.5">
          <Label>Task title *</Label>
          <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Book mehendi artist" />
        </div>
        <div className="space-y-1.5">
          <Label>Description</Label>
          <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional details..." rows={2} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Priority</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{TASK_PRIORITIES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{TASK_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
              <SelectContent>{TASK_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Due date</Label>
            <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
          </div>
        </div>
      </DialogBody>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={save} disabled={saving || !title.trim()}>
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          {task ? 'Save Changes' : 'Add Task'}
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}

export default function EventPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = use(params)
  const event = EVENTS.find(e => e.slug === eventId)
  if (!event) notFound()

  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editTask, setEditTask] = useState<Task | null>(null)
  const [view, setView] = useState<'board' | 'list'>('board')

  const completed = tasks.filter(t => t.status === 'Completed').length
  const pct = tasks.length ? Math.round((completed / tasks.length) * 100) : 0

  async function loadTasks() {
    try {
      const { data } = await createClient().from('tasks').select('*').eq('event_id', event!.id).order('created_at', { ascending: false })
      setTasks((data || []) as Task[])
    } catch (e) { console.error('Load tasks error', e) }
    setLoading(false)
  }

  async function deleteTask(id: string) {
    try { await createClient().from('tasks').delete().eq('id', id) } catch (e) { console.error(e) }
    loadTasks()
  }

  useEffect(() => {
    loadTasks()
    const sb = createClient()
    const sub = sb.channel(`event-tasks-${eventId}`).on('postgres_changes', { event: '*', schema: 'public', table: 'tasks', filter: `event_id=eq.${event!.id}` }, loadTasks).subscribe()
    return () => { sub.unsubscribe() }
  }, [eventId])

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Event Header */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl p-5 bg-gradient-to-br ${event.gradient} relative overflow-hidden`}
          >
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white translate-x-16 -translate-y-16" />
            </div>
            <div className="relative flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{event.icon}</span>
                  <h1 className="font-display text-2xl font-bold text-white">{event.name}</h1>
                </div>
                <p className="text-white/70 text-sm">
                  {formatDate(event.date)}{event.time ? ` · ${event.time}` : ''} · {event.venue || 'Venue TBD'}
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-white">{pct}%</div>
                <div className="text-white/70 text-xs">complete</div>
                <div className="text-white/60 text-xs mt-1">{completed}/{tasks.length} tasks done</div>
              </div>
            </div>
            <div className="mt-3 h-1.5 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-amber-300 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
          </motion.div>

          {/* Tabs */}
          <div className="flex items-center gap-2">
            {[
              { label: 'Tasks', icon: null },
              { label: 'Bookings', icon: BookOpen },
              { label: 'Shopping', icon: ShoppingCart },
              { label: 'Budget', icon: DollarSign },
              { label: 'Notes', icon: FileText },
            ].map(({ label, icon: Icon }) => (
              <button
                key={label}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${label === 'Tasks' ? 'bg-white text-emerald-700 shadow-sm border border-gray-100' : 'text-gray-500 hover:bg-white hover:text-gray-700'}`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                {label}
              </button>
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-white border border-gray-100 rounded-lg p-1">
              <button onClick={() => setView('board')} className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${view === 'board' ? 'bg-gray-100 text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}>
                <LayoutGrid className="w-3.5 h-3.5" /> Board
              </button>
              <button onClick={() => setView('list')} className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${view === 'list' ? 'bg-gray-100 text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}>
                <List className="w-3.5 h-3.5" /> List
              </button>
            </div>
            <Button size="sm" onClick={() => { setEditTask(null); setShowForm(true) }}>
              <Plus className="w-4 h-4" /> Add Task
            </Button>
          </div>

          {/* Board / List */}
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
            </div>
          ) : view === 'board' ? (
            <KanbanBoard tasks={tasks} onEdit={t => { setEditTask(t); setShowForm(true) }} onDelete={deleteTask} />
          ) : (
            <div className="space-y-2">
              {tasks.length === 0 && <p className="text-sm text-gray-400 text-center py-8">No tasks yet. Add your first one!</p>}
              {tasks.map(task => (
                <Card key={task.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-3 flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${task.status === 'Completed' ? 'bg-green-500' : task.status === 'In Progress' ? 'bg-blue-500' : 'bg-gray-300'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{task.title}</p>
                      {task.category && <p className="text-xs text-gray-400">{task.category}</p>}
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${getPriorityColor(task.priority)}`}>{task.priority}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${getStatusColor(task.status)}`}>{task.status}</span>
                    {task.due_date && <span className="text-xs text-gray-400">{formatDate(task.due_date)}</span>}
                    <button onClick={() => { setEditTask(task); setShowForm(true) }} className="p-1 text-gray-400 hover:text-gray-600"><Edit2 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => deleteTask(task.id)} className="p-1 text-gray-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        {showForm && (
          <TaskForm
            event={event}
            task={editTask}
            onClose={() => setShowForm(false)}
            onSaved={() => { setShowForm(false); loadTasks() }}
          />
        )}
      </Dialog>
    </div>
  )
}
