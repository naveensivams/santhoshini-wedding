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
        <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
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

const BOOKING_CATS = ['Venue','Catering','Photography','Videography','Flowers & Decor','Music & DJ','Hair & Makeup','Mehendi','Jewelry','Clothing','Transportation','Accommodation','Priest','Invitation Cards','Gifts & Favors','Other']
const BOOKING_STATUSES_LIST = ['Pending','Enquired','Negotiating','Booked','Confirmed','Completed','Cancelled']
const SHOPPING_CATS = ['Clothing','Jewelry','Accessories','Decor','Food & Catering','Flowers','Gifts','Electronics','Beauty','Stationery','Other']
const BUDGET_TYPES_LIST = ['Expense','Advance','Payment','Refund']

function QuickBookingForm({ event, onClose, onSaved }: { event: any; onClose: () => void; onSaved: () => void }) {
  const [category, setCategory] = useState('')
  const [vendor, setVendor] = useState('')
  const [status, setStatus] = useState('Pending')
  const [advance, setAdvance] = useState('')
  const [saving, setSaving] = useState(false)
  async function save() {
    if (!category) return
    setSaving(true)
    const { error } = await createClient().from('bookings').insert({ id: crypto.randomUUID(), category, vendor_name: vendor||null, status, event_id: event.id, event_name: event.name, advance_paid: parseFloat(advance)||0, balance_due: 0, contract_signed: false, trial_scheduled: false })
    setSaving(false)
    if (!error) onSaved()
  }
  return (
    <DialogContent>
      <DialogHeader><DialogTitle>Add Booking</DialogTitle></DialogHeader>
      <DialogBody className="space-y-3">
        <div className="space-y-1.5"><Label>Category *</Label><Select value={category} onValueChange={setCategory}><SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger><SelectContent>{BOOKING_CATS.map(c=><SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
        <div className="space-y-1.5"><Label>Vendor name</Label><Input value={vendor} onChange={e=>setVendor(e.target.value)} placeholder="e.g. XYZ Photography" /></div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5"><Label>Status</Label><Select value={status} onValueChange={setStatus}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{BOOKING_STATUSES_LIST.map(s=><SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-1.5"><Label>Advance (₹)</Label><Input type="number" value={advance} onChange={e=>setAdvance(e.target.value)} placeholder="0" /></div>
        </div>
      </DialogBody>
      <DialogFooter><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={save} disabled={saving||!category}>{saving&&<Loader2 className="w-4 h-4 animate-spin mr-1"/>}Add</Button></DialogFooter>
    </DialogContent>
  )
}

function QuickShoppingForm({ event, onClose, onSaved }: { event: any; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [qty, setQty] = useState('1')
  const [budget, setBudget] = useState('')
  const [saving, setSaving] = useState(false)
  async function save() {
    if (!name.trim()) return
    setSaving(true)
    const { error } = await createClient().from('shopping_items').insert({ id: crypto.randomUUID(), name: name.trim(), category: category||null, quantity: parseInt(qty)||1, budget_amount: budget?parseFloat(budget):null, event_id: event.id, event_name: event.name, status: 'Pending' })
    setSaving(false)
    if (!error) onSaved()
  }
  return (
    <DialogContent>
      <DialogHeader><DialogTitle>Add Shopping Item</DialogTitle></DialogHeader>
      <DialogBody className="space-y-3">
        <div className="space-y-1.5"><Label>Item name *</Label><Input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Bridal saree" /></div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5"><Label>Category</Label><Select value={category} onValueChange={setCategory}><SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger><SelectContent>{SHOPPING_CATS.map(c=><SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-1.5"><Label>Qty</Label><Input type="number" value={qty} onChange={e=>setQty(e.target.value)} min="1" /></div>
        </div>
        <div className="space-y-1.5"><Label>Budget (₹)</Label><Input type="number" value={budget} onChange={e=>setBudget(e.target.value)} placeholder="0" /></div>
      </DialogBody>
      <DialogFooter><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={save} disabled={saving||!name.trim()}>{saving&&<Loader2 className="w-4 h-4 animate-spin mr-1"/>}Add</Button></DialogFooter>
    </DialogContent>
  )
}

function QuickBudgetForm({ event, onClose, onSaved }: { event: any; onClose: () => void; onSaved: () => void }) {
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [type, setType] = useState('Expense')
  const [vendor, setVendor] = useState('')
  const [saving, setSaving] = useState(false)
  async function save() {
    if (!description||!amount) return
    setSaving(true)
    const { error } = await createClient().from('budget_entries').insert({ id: crypto.randomUUID(), description, amount: parseFloat(amount), type, event_id: event.id, event_name: event.name, vendor_name: vendor||null, date: new Date().toISOString().split('T')[0], category: null })
    setSaving(false)
    if (!error) onSaved()
  }
  return (
    <DialogContent>
      <DialogHeader><DialogTitle>Add Budget Entry</DialogTitle></DialogHeader>
      <DialogBody className="space-y-3">
        <div className="space-y-1.5"><Label>Description *</Label><Input value={description} onChange={e=>setDescription(e.target.value)} placeholder="e.g. Catering advance" /></div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5"><Label>Amount (₹) *</Label><Input type="number" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="0" /></div>
          <div className="space-y-1.5"><Label>Type</Label><Select value={type} onValueChange={setType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{BUDGET_TYPES_LIST.map(t=><SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
        </div>
        <div className="space-y-1.5"><Label>Vendor</Label><Input value={vendor} onChange={e=>setVendor(e.target.value)} placeholder="Optional" /></div>
      </DialogBody>
      <DialogFooter><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={save} disabled={saving||!description||!amount}>{saving&&<Loader2 className="w-4 h-4 animate-spin mr-1"/>}Add</Button></DialogFooter>
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
  const [activeTab, setActiveTab] = useState('Tasks')
  const [bookings, setBookings] = useState<any[]>([])
  const [shopping, setShopping] = useState<any[]>([])
  const [budgetEntries, setBudgetEntries] = useState<any[]>([])
  const [notes, setNotes] = useState('')
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [showShoppingForm, setShowShoppingForm] = useState(false)
  const [showBudgetForm, setShowBudgetForm] = useState(false)
  const [notesSaving, setNotesSaving] = useState(false)

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

  async function loadBookings() {
    const { data } = await createClient().from('bookings').select('*').eq('event_id', event!.id).order('created_at', { ascending: false })
    setBookings(data || [])
  }
  async function loadShopping() {
    const { data } = await createClient().from('shopping_items').select('*').eq('event_id', event!.id).order('created_at', { ascending: false })
    setShopping(data || [])
  }
  async function loadBudgetEntries() {
    const { data } = await createClient().from('budget_entries').select('*').eq('event_id', event!.id).order('created_at', { ascending: false })
    setBudgetEntries(data || [])
  }
  async function loadNotes() {
    const { data } = await createClient().from('settings').select('value').eq('key', `notes_${event!.id}`).maybeSingle()
    setNotes(data?.value || '')
  }
  async function saveNotes(val: string) {
    setNotesSaving(true)
    await createClient().from('settings').upsert({ key: `notes_${event!.id}`, value: val }, { onConflict: 'key' })
    setNotesSaving(false)
  }
  async function deleteBooking(id: string) { await createClient().from('bookings').delete().eq('id', id); loadBookings() }
  async function deleteShopping(id: string) { await createClient().from('shopping_items').delete().eq('id', id); loadShopping() }
  async function deleteBudgetEntry(id: string) { await createClient().from('budget_entries').delete().eq('id', id); loadBudgetEntries() }
  async function toggleShopping(item: any) {
    await createClient().from('shopping_items').update({ status: item.status === 'Purchased' ? 'Pending' : 'Purchased' }).eq('id', item.id)
    loadShopping()
  }

  useEffect(() => {
    loadTasks(); loadBookings(); loadShopping(); loadBudgetEntries(); loadNotes()
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
                onClick={() => setActiveTab(label)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeTab === label ? 'bg-white text-emerald-700 shadow-sm border border-gray-100' : 'text-gray-500 hover:bg-white hover:text-gray-700'}`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                {label}
              </button>
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            {activeTab === 'Tasks' && (
              <div className="flex items-center gap-1 bg-white border border-gray-100 rounded-lg p-1">
                <button onClick={() => setView('board')} className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${view === 'board' ? 'bg-gray-100 text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}>
                  <LayoutGrid className="w-3.5 h-3.5" /> Board
                </button>
                <button onClick={() => setView('list')} className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${view === 'list' ? 'bg-gray-100 text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}>
                  <List className="w-3.5 h-3.5" /> List
                </button>
              </div>
            )}
            {activeTab === 'Tasks' && <Button size="sm" onClick={() => { setEditTask(null); setShowForm(true) }}><Plus className="w-4 h-4" /> Add Task</Button>}
            {activeTab === 'Bookings' && <Button size="sm" onClick={() => setShowBookingForm(true)}><Plus className="w-4 h-4" /> Add Booking</Button>}
            {activeTab === 'Shopping' && <Button size="sm" onClick={() => setShowShoppingForm(true)}><Plus className="w-4 h-4" /> Add Item</Button>}
            {activeTab === 'Budget' && <Button size="sm" onClick={() => setShowBudgetForm(true)}><Plus className="w-4 h-4" /> Add Entry</Button>}
          </div>

          {/* Tasks */}
          {activeTab === 'Tasks' && (loading ? (
            <div className="flex items-center justify-center h-40"><Loader2 className="w-6 h-6 text-emerald-500 animate-spin" /></div>
          ) : view === 'board' ? (
            <KanbanBoard tasks={tasks} onEdit={t => { setEditTask(t); setShowForm(true) }} onDelete={deleteTask} />
          ) : (
            <div className="space-y-2">
              {tasks.length === 0 && <p className="text-sm text-gray-400 text-center py-8">No tasks yet. Add your first one!</p>}
              {tasks.map(task => (
                <Card key={task.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-3 flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${task.status === 'Completed' ? 'bg-green-500' : task.status === 'In Progress' ? 'bg-blue-500' : 'bg-gray-300'}`} />
                    <div className="flex-1 min-w-0"><p className="text-sm font-medium text-gray-900">{task.title}</p>{task.category && <p className="text-xs text-gray-400">{task.category}</p>}</div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${getPriorityColor(task.priority)}`}>{task.priority}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${getStatusColor(task.status)}`}>{task.status}</span>
                    {task.due_date && <span className="text-xs text-gray-400">{formatDate(task.due_date)}</span>}
                    <button onClick={() => { setEditTask(task); setShowForm(true) }} className="p-1 text-gray-400 hover:text-gray-600"><Edit2 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => deleteTask(task.id)} className="p-1 text-gray-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ))}

          {/* Bookings */}
          {activeTab === 'Bookings' && (
            <div className="space-y-2">
              {bookings.length === 0 && <p className="text-sm text-gray-400 text-center py-8">No bookings yet. Add your first one!</p>}
              {bookings.map(b => (
                <Card key={b.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className="flex-1 min-w-0"><p className="text-sm font-medium text-gray-900">{b.category}</p>{b.vendor_name && <p className="text-xs text-gray-400">{b.vendor_name}</p>}</div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${b.status === 'Confirmed' ? 'bg-green-100 text-green-700' : b.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{b.status}</span>
                    {b.advance_paid > 0 && <span className="text-xs text-gray-500">₹{b.advance_paid}</span>}
                    <button onClick={() => deleteBooking(b.id)} className="p-1 text-gray-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Shopping */}
          {activeTab === 'Shopping' && (
            <div className="space-y-2">
              {shopping.length === 0 && <p className="text-sm text-gray-400 text-center py-8">No shopping items yet. Add your first one!</p>}
              {shopping.map(item => (
                <Card key={item.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-3 flex items-center gap-3">
                    <button onClick={() => toggleShopping(item)} className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 text-xs font-bold transition-colors ${item.status === 'Purchased' ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-300 text-transparent'}`}>✓</button>
                    <div className="flex-1 min-w-0"><p className={`text-sm font-medium ${item.status === 'Purchased' ? 'line-through text-gray-400' : 'text-gray-900'}`}>{item.name}</p>{item.category && <p className="text-xs text-gray-400">{item.category} · qty: {item.quantity}</p>}</div>
                    {item.budget_amount && <span className="text-xs text-gray-500">₹{item.budget_amount}</span>}
                    <button onClick={() => deleteShopping(item.id)} className="p-1 text-gray-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Budget */}
          {activeTab === 'Budget' && (
            <div className="space-y-2">
              {budgetEntries.length > 0 && <div className="bg-white border border-gray-100 rounded-xl p-3 flex items-center justify-between"><span className="text-sm text-gray-600">Total</span><span className="text-sm font-bold text-gray-900">₹{budgetEntries.reduce((s,e)=>s+e.amount,0).toLocaleString()}</span></div>}
              {budgetEntries.length === 0 && <p className="text-sm text-gray-400 text-center py-8">No budget entries yet. Add your first one!</p>}
              {budgetEntries.map(entry => (
                <Card key={entry.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className="flex-1 min-w-0"><p className="text-sm font-medium text-gray-900">{entry.description}</p>{entry.vendor_name && <p className="text-xs text-gray-400">{entry.vendor_name}</p>}</div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${entry.type === 'Refund' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>{entry.type}</span>
                    <span className="text-sm font-semibold text-gray-900">₹{entry.amount.toLocaleString()}</span>
                    <button onClick={() => deleteBudgetEntry(entry.id)} className="p-1 text-gray-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Notes */}
          {activeTab === 'Notes' && (
            <div className="space-y-3">
              <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Write notes for this event..." rows={12} />
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">{notes.length} characters</span>
                <Button size="sm" onClick={() => saveNotes(notes)} disabled={notesSaving}>{notesSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Notes'}</Button>
              </div>
            </div>
          )}
        </main>
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        {showForm && <TaskForm event={event} task={editTask} onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); loadTasks() }} />}
      </Dialog>
      <Dialog open={showBookingForm} onOpenChange={setShowBookingForm}>
        {showBookingForm && <QuickBookingForm event={event} onClose={() => setShowBookingForm(false)} onSaved={() => { setShowBookingForm(false); loadBookings() }} />}
      </Dialog>
      <Dialog open={showShoppingForm} onOpenChange={setShowShoppingForm}>
        {showShoppingForm && <QuickShoppingForm event={event} onClose={() => setShowShoppingForm(false)} onSaved={() => { setShowShoppingForm(false); loadShopping() }} />}
      </Dialog>
      <Dialog open={showBudgetForm} onOpenChange={setShowBudgetForm}>
        {showBudgetForm && <QuickBudgetForm event={event} onClose={() => setShowBudgetForm(false)} onSaved={() => { setShowBudgetForm(false); loadBudgetEntries() }} />}
      </Dialog>
    </div>
  )
}
