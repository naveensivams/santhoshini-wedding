'use client'
import { useState, useEffect } from 'react'
import { Plus, Loader2, Trash2, Edit2 } from 'lucide-react'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { EVENTS, TASK_PRIORITIES, TASK_STATUSES, TASK_CATEGORIES } from '@/lib/constants'
import { getPriorityColor, getStatusColor, formatDate } from '@/lib/utils'
import type { Task } from '@/types'

const STORAGE_KEY = 'wedding_tasks'
function loadTasks(): Task[] { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] } }
function saveTasks(tasks: Task[]) { localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)) }

function TaskForm({ task, onClose, onSaved }: { task?: Task | null; onClose: () => void; onSaved: () => void }) {
  const [title, setTitle] = useState(task?.title || '')
  const [description, setDescription] = useState(task?.description || '')
  const [category, setCategory] = useState(task?.category || '')
  const [priority, setPriority] = useState<string>(task?.priority || 'Medium')
  const [status, setStatus] = useState<string>(task?.status || 'Not Started')
  const [dueDate, setDueDate] = useState(task?.due_date || '')
  const [eventId, setEventId] = useState(task?.event_id || '')
  const [saving, setSaving] = useState(false)

  function save() {
    if (!title.trim()) return
    setSaving(true)
    const all = loadTasks()
    const payload = { title: title.trim(), description, category, priority, status, due_date: dueDate || undefined, event_id: eventId || undefined, completion_percent: status === 'Completed' ? 100 : 0, created_at: new Date().toISOString() }
    if (task?.id) {
      saveTasks(all.map(t => t.id === task.id ? { ...t, ...payload } as Task : t))
    } else {
      saveTasks([{ ...payload, id: crypto.randomUUID() } as Task, ...all])
    }
    setSaving(false)
    onSaved()
  }

  return (
    <DialogContent>
      <DialogHeader><DialogTitle>{task ? 'Edit Task' : 'Add Task'}</DialogTitle></DialogHeader>
      <DialogBody className="space-y-3">
        <div className="space-y-1.5">
          <Label>Title *</Label>
          <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Task title" />
        </div>
        <div className="space-y-1.5">
          <Label>Description</Label>
          <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional details..." rows={2} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Event</Label>
            <Select value={eventId} onValueChange={setEventId}>
              <SelectTrigger><SelectValue placeholder="General" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">General</SelectItem>
                {EVENTS.map(e => <SelectItem key={e.id} value={e.id}>{e.icon} {e.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
              <SelectContent>{TASK_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
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
          {task ? 'Save' : 'Add Task'}
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editTask, setEditTask] = useState<Task | null>(null)
  const [filterPriority, setFilterPriority] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterEvent, setFilterEvent] = useState('')

  function load() {
    setTasks(loadTasks())
    setLoading(false)
  }

  function deleteTask(id: string) {
    saveTasks(loadTasks().filter(t => t.id !== id))
    load()
  }

  useEffect(() => { load() }, [])

  const filtered = tasks.filter(t => {
    if (filterPriority && t.priority !== filterPriority) return false
    if (filterStatus && t.status !== filterStatus) return false
    if (filterEvent && t.event_id !== filterEvent) return false
    return true
  })

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-5 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">All Tasks</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">{tasks.filter(t => t.status === 'Completed').length}/{tasks.length} completed</p>
            </div>
            <Button onClick={() => { setEditTask(null); setShowForm(true) }}>
              <Plus className="w-4 h-4" /> Add Task
            </Button>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3">
            <Select value={filterEvent} onValueChange={setFilterEvent}>
              <SelectTrigger className="w-36 h-8 text-sm"><SelectValue placeholder="All events" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">All events</SelectItem>
                {EVENTS.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-32 h-8 text-sm"><SelectValue placeholder="All priorities" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">All priorities</SelectItem>
                {TASK_PRIORITIES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-36 h-8 text-sm"><SelectValue placeholder="All statuses" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">All statuses</SelectItem>
                {TASK_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-40"><Loader2 className="w-6 h-6 text-emerald-500 animate-spin" /></div>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No tasks found. Add your first task!</p>
          ) : (
            <div className="space-y-2">
              {filtered.map(task => {
                const event = EVENTS.find(e => e.id === task.event_id)
                return (
                  <Card key={task.id} className="hover:shadow-md transition-shadow group">
                    <CardContent className="p-3 flex items-center gap-3">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${task.status === 'Completed' ? 'bg-green-500' : task.status === 'In Progress' ? 'bg-blue-500' : task.status === 'Blocked' ? 'bg-red-500' : 'bg-gray-300'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{task.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {event && <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ backgroundColor: event.color + '20', color: event.color }}>{event.name}</span>}
                          {task.category && <span className="text-xs text-gray-400 dark:text-gray-500">{task.category}</span>}
                        </div>
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium ${getPriorityColor(task.priority)}`}>{task.priority}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${getStatusColor(task.status)}`}>{task.status}</span>
                      {task.due_date && <span className="text-xs text-gray-400 dark:text-gray-500">{formatDate(task.due_date)}</span>}
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                        <button onClick={() => { setEditTask(task); setShowForm(true) }} className="p-1 text-gray-400 hover:text-gray-600"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => deleteTask(task.id)} className="p-1 text-gray-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </main>
      </div>
      <Dialog open={showForm} onOpenChange={setShowForm}>
        {showForm && <TaskForm task={editTask} onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); load() }} />}
      </Dialog>
    </div>
  )
}
