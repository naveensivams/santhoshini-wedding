'use client'
import { useState, useEffect } from 'react'
import { Plus, Loader2, Trash2 } from 'lucide-react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { EVENTS } from '@/lib/constants'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { BudgetEntry } from '@/types'

const SK = 'wedding_budget'
function ls(): BudgetEntry[] { try { return JSON.parse(localStorage.getItem(SK)||'[]') } catch { return [] } }
function ss(d: BudgetEntry[]) { localStorage.setItem(SK, JSON.stringify(d)) }

const TYPES = ['Budget', 'Expense', 'Advance', 'Payment'] as const
const COLORS = ['#059669', '#D4AF37', '#f59e0b', '#7c3aed', '#ef4444', '#3b82f6']

function BudgetForm({ entry, onClose, onSaved }: { entry?: BudgetEntry | null; onClose: () => void; onSaved: () => void }) {
  const [description, setDescription] = useState(entry?.description || '')
  const [amount, setAmount] = useState(String(entry?.amount || ''))
  const [type, setType] = useState<string>(entry?.type || 'Expense')
  const [eventId, setEventId] = useState(entry?.event_id || '')
  const [category, setCategory] = useState(entry?.category || '')
  const [date, setDate] = useState(entry?.date || new Date().toISOString().split('T')[0])
  const [vendorName, setVendorName] = useState(entry?.vendor_name || '')
  const [saving, setSaving] = useState(false)

  function save() {
    if (!description || !amount) return
    setSaving(true)
    const selectedEvent = EVENTS.find(e => e.id === eventId)
    const payload = { description, amount: parseFloat(amount), type: type as BudgetEntry['type'], event_id: eventId||undefined, event_name: selectedEvent?.name||undefined, category: category||undefined, date, vendor_name: vendorName||undefined, created_at: new Date().toISOString() }
    const all = ls()
    if (entry?.id) { ss(all.map(e => e.id===entry.id ? {...e,...payload} : e)) } else { ss([{...payload,id:crypto.randomUUID()},...all]) }
    setSaving(false); onSaved()
  }

  return (
    <DialogContent>
      <DialogHeader><DialogTitle>{entry ? 'Edit Entry' : 'Add Budget Entry'}</DialogTitle></DialogHeader>
      <DialogBody className="space-y-3">
        <div className="space-y-1.5">
          <Label>Description *</Label>
          <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="e.g. Photographer advance" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Amount (₹) *</Label>
            <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" />
          </div>
          <div className="space-y-1.5">
            <Label>Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
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
            <Label>Date</Label>
            <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Vendor / Payee</Label>
          <Input value={vendorName} onChange={e => setVendorName(e.target.value)} placeholder="Who was paid?" />
        </div>
      </DialogBody>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={save} disabled={saving || !description || !amount}>
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          {entry ? 'Save' : 'Add Entry'}
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}

const BUDGET_TOTAL_KEY = 'wedding_total_budget'

export default function BudgetPage() {
  const [entries, setEntries] = useState<BudgetEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editEntry, setEditEntry] = useState<BudgetEntry | null>(null)
  const [totalBudgetInput, setTotalBudgetInput] = useState('')
  const [savedTotal, setSavedTotal] = useState(0)

  function load() {
    setEntries(ls())
    const saved = parseFloat(localStorage.getItem(BUDGET_TOTAL_KEY)||'0')
    setSavedTotal(saved)
    setTotalBudgetInput(saved > 0 ? String(saved) : '')
    setLoading(false)
  }
  function deleteEntry(id: string) { ss(ls().filter(e => e.id!==id)); load() }
  function saveTotalBudget() {
    const val = parseFloat(totalBudgetInput) || 0
    localStorage.setItem(BUDGET_TOTAL_KEY, String(val))
    setSavedTotal(val)
  }

  useEffect(() => { load() }, [])

  const totalBudget = savedTotal || entries.filter(e => e.type === 'Budget').reduce((s, e) => s + e.amount, 0)
  const spent = entries.filter(e => e.type === 'Expense' || e.type === 'Advance').reduce((s, e) => s + e.amount, 0)
  const remaining = totalBudget - spent

  const byEvent = EVENTS.map(ev => ({
    name: ev.name,
    budget: entries.filter(e => e.event_id === ev.id && e.type === 'Budget').reduce((s, e) => s + e.amount, 0),
    spent: entries.filter(e => e.event_id === ev.id && (e.type === 'Expense' || e.type === 'Advance')).reduce((s, e) => s + e.amount, 0),
  })).filter(e => e.budget > 0 || e.spent > 0)

  const byCategory = Object.entries(
    entries.filter(e => e.type === 'Expense' || e.type === 'Advance').reduce((acc, e) => {
      const key = e.category || 'General'
      acc[key] = (acc[key] || 0) + e.amount
      return acc
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }))

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-5 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Budget</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Every rupee planned, spent and remaining — across all events.</p>
            </div>
            <Button onClick={() => { setEditEntry(null); setShowForm(true) }}>
              <Plus className="w-4 h-4" /> Add Entry
            </Button>
          </div>

          {/* Total Budget Setter */}
          <div className="flex items-center gap-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl px-4 py-3">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Set Total Wedding Budget (₹)</span>
            <Input
              type="number"
              className="w-40 h-8 text-sm"
              placeholder="e.g. 500000"
              value={totalBudgetInput}
              onChange={e => setTotalBudgetInput(e.target.value)}
              onBlur={saveTotalBudget}
              onKeyDown={e => e.key === 'Enter' && saveTotalBudget()}
            />
            <span className="text-xs text-gray-400 dark:text-gray-500">Press Enter or click away to save</span>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Total budget', value: formatCurrency(totalBudget), color: 'text-gray-900' },
              { label: 'Spent so far', value: formatCurrency(spent), color: 'text-red-600' },
              { label: 'Remaining', value: formatCurrency(remaining), color: remaining >= 0 ? 'text-emerald-600' : 'text-red-600' },
            ].map(({ label, value, color }) => (
              <Card key={label}>
                <CardContent className="p-5">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{label}</p>
                  <p className={`text-2xl font-bold ${color}`}>{value}</p>
                  {totalBudget > 0 && label === 'Spent so far' && (
                    <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, (spent / totalBudget) * 100)}%` }} />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts */}
          {byCategory.length > 0 || byEvent.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {byCategory.length > 0 && (
                <Card>
                  <CardHeader><CardTitle>Spending by category</CardTitle></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie data={byCategory} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                          {byCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
              {byEvent.length > 0 && (
                <Card>
                  <CardHeader><CardTitle>Budget vs spent by event</CardTitle></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={byEvent}>
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v / 100000).toFixed(0)}L`} />
                        <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                        <Legend />
                        <Bar dataKey="budget" fill="#d1fae5" name="Budget" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="spent" fill="#059669" name="Spent" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : null}

          {/* Expense history */}
          <Card>
            <CardHeader><CardTitle>Expense history</CardTitle></CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center h-20"><Loader2 className="w-5 h-5 text-emerald-500 animate-spin" /></div>
              ) : entries.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">No entries yet. Add your first budget entry!</p>
              ) : (
                <div className="divide-y divide-gray-50">
                  {entries.map(entry => (
                    <div key={entry.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 group">
                      <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${entry.type === 'Budget' ? 'bg-blue-400' : entry.type === 'Expense' ? 'bg-red-400' : entry.type === 'Advance' ? 'bg-amber-400' : 'bg-green-400'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{entry.description}</p>
                        <p className="text-xs text-gray-400">{entry.event_name || 'General'}{entry.vendor_name ? ` · ${entry.vendor_name}` : ''} · {formatDate(entry.date)}</p>
                      </div>
                      <span className={`text-sm font-semibold ${entry.type === 'Budget' ? 'text-blue-600' : entry.type === 'Expense' ? 'text-red-600' : 'text-amber-600'}`}>
                        {entry.type === 'Budget' ? '+' : '-'}{formatCurrency(entry.amount)}
                      </span>
                      <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{entry.type}</span>
                      <button onClick={() => deleteEntry(entry.id)} className="p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
      <Dialog open={showForm} onOpenChange={setShowForm}>
        {showForm && <BudgetForm entry={editEntry} onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); load() }} />}
      </Dialog>
    </div>
  )
}
