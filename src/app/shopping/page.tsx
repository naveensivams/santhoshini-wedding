'use client'
import { useState, useEffect } from 'react'
import { Plus, Loader2, Trash2, Edit2, CheckSquare, Square } from 'lucide-react'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SHOPPING_CATEGORIES, EVENTS } from '@/lib/constants'
import { formatCurrency } from '@/lib/utils'
import type { ShoppingItem } from '@/types'

const SK = 'wedding_shopping'
function ls(): ShoppingItem[] { try { return JSON.parse(localStorage.getItem(SK)||'[]') } catch { return [] } }
function ss(d: ShoppingItem[]) { localStorage.setItem(SK, JSON.stringify(d)) }

function ShoppingForm({ item, onClose, onSaved }: { item?: ShoppingItem | null; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState(item?.name || '')
  const [category, setCategory] = useState(item?.category || '')
  const [quantity, setQuantity] = useState(String(item?.quantity || 1))
  const [budget, setBudget] = useState(String(item?.budget_amount || ''))
  const [store, setStore] = useState(item?.store || '')
  const [eventId, setEventId] = useState(item?.event_id || '')
  const [plannedDate, setPlannedDate] = useState(item?.planned_date || '')
  const [saving, setSaving] = useState(false)

  function save() {
    if (!name.trim()) return
    setSaving(true)
    const selectedEvent = EVENTS.find(e => e.id === eventId)
    const payload = { name: name.trim(), category: category||undefined, quantity: parseInt(quantity)||1, budget_amount: budget ? parseFloat(budget) : undefined, store: store||undefined, planned_date: plannedDate||undefined, event_id: eventId||undefined, event_name: selectedEvent?.name||undefined, status: (item?.status || 'Pending') as ShoppingItem['status'], created_at: new Date().toISOString() }
    const all = ls()
    if (item?.id) { ss(all.map(i => i.id===item.id ? {...i,...payload} : i)) } else { ss([{...payload,id:crypto.randomUUID()},...all]) }
    setSaving(false); onSaved()
  }

  return (
    <DialogContent>
      <DialogHeader><DialogTitle>{item ? 'Edit Item' : 'Add Shopping Item'}</DialogTitle></DialogHeader>
      <DialogBody className="space-y-3">
        <div className="space-y-1.5">
          <Label>Item name *</Label>
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Bridal saree" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
              <SelectContent>{SHOPPING_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
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
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Quantity</Label>
            <Input type="number" min="1" value={quantity} onChange={e => setQuantity(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Budget (₹)</Label>
            <Input type="number" value={budget} onChange={e => setBudget(e.target.value)} placeholder="0" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Store / Where to buy</Label>
          <Input value={store} onChange={e => setStore(e.target.value)} placeholder="e.g. Silk India, Chandni Chowk" />
        </div>
        <div className="space-y-1.5">
          <Label>Planned shopping date 📅</Label>
          <Input type="date" value={plannedDate} onChange={e => setPlannedDate(e.target.value)} />
        </div>
      </DialogBody>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={save} disabled={saving || !name.trim()}>
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          {item ? 'Save' : 'Add Item'}
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}

export default function ShoppingPage() {
  const [items, setItems] = useState<ShoppingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState<ShoppingItem | null>(null)

  function load() { setItems(ls()); setLoading(false) }
  function toggleStatus(item: ShoppingItem) { ss(ls().map(i => i.id===item.id ? {...i,status:(item.status==='Purchased'?'Pending':'Purchased') as ShoppingItem['status']} : i)); load() }
  function deleteItem(id: string) { ss(ls().filter(i => i.id!==id)); load() }

  useEffect(() => { load() }, [])

  const purchased = items.filter(i => i.status === 'Purchased').length
  const totalBudget = items.reduce((s, i) => s + (i.budget_amount || 0), 0)
  const byCategory = SHOPPING_CATEGORIES.filter(cat => items.some(i => i.category === cat))

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-5 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Shopping Planner</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">{purchased}/{items.length} purchased · {formatCurrency(totalBudget)} total budget</p>
            </div>
            <Button onClick={() => { setEditItem(null); setShowForm(true) }}>
              <Plus className="w-4 h-4" /> Add Item
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-40"><Loader2 className="w-6 h-6 text-emerald-500 animate-spin" /></div>
          ) : items.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-sm">No shopping items yet. Start adding what you need to buy!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {(byCategory.length > 0 ? byCategory : ['General']).map(cat => {
                const catItems = byCategory.length > 0 ? items.filter(i => i.category === cat) : items
                if (catItems.length === 0) return null
                return (
                  <div key={cat}>
                    <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">{cat}</h2>
                    <div className="space-y-2">
                      {catItems.map(item => (
                        <Card key={item.id} className={`transition-opacity ${item.status === 'Purchased' ? 'opacity-60' : ''}`}>
                          <CardContent className="p-3 flex items-center gap-3">
                            <button onClick={() => toggleStatus(item)} className="shrink-0 text-emerald-500 hover:text-emerald-700">
                              {item.status === 'Purchased' ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5 text-gray-300" />}
                            </button>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium ${item.status === 'Purchased' ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-gray-100'}`}>{item.name}</p>
                              <p className="text-xs text-gray-400 dark:text-gray-500">
                                Qty: {item.quantity}{item.store ? ` · ${item.store}` : ''}{item.event_name ? ` · ${item.event_name}` : ''}
                              </p>
                            </div>
                            {item.budget_amount && <span className="text-sm font-semibold text-emerald-600 shrink-0">{formatCurrency(item.budget_amount)}</span>}
                            <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${item.status === 'Purchased' ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'}`}>{item.status}</span>
                            <button onClick={() => { setEditItem(item); setShowForm(true) }} className="p-1 text-gray-400 hover:text-gray-600"><Edit2 className="w-3.5 h-3.5" /></button>
                            <button onClick={() => deleteItem(item.id)} className="p-1 text-gray-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </main>
      </div>
      <Dialog open={showForm} onOpenChange={setShowForm}>
        {showForm && <ShoppingForm item={editItem} onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); load() }} />}
      </Dialog>
    </div>
  )
}
