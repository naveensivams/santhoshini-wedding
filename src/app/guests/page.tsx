'use client'
import { useState, useEffect } from 'react'
import { Plus, Search, Loader2, Trash2, Edit2, CheckCircle, Clock, XCircle } from 'lucide-react'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { GUEST_GROUPS } from '@/lib/constants'
import type { Guest } from '@/types'

const SK = 'wedding_guests'
function ls(): Guest[] { try { return JSON.parse(localStorage.getItem(SK)||'[]') } catch { return [] } }
function ss(d: Guest[]) { localStorage.setItem(SK, JSON.stringify(d)) }

const SIDES = ['Bride', 'Groom', 'Both'] as const
const RSVP = ['Pending', 'Confirmed', 'Declined'] as const

function GuestForm({ guest, onClose, onSaved }: { guest?: Guest | null; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState(guest?.name || '')
  const [phone, setPhone] = useState(guest?.phone || '')
  const [email, setEmail] = useState(guest?.email || '')
  const [side, setSide] = useState<string>(guest?.side || 'Bride')
  const [group, setGroup] = useState(guest?.group || 'Family')
  const [rsvp, setRsvp] = useState<string>(guest?.rsvp_status || 'Pending')
  const [food, setFood] = useState(guest?.food_preference || '')
  const [inviteSent, setInviteSent] = useState(guest?.invitation_sent || false)
  const [saving, setSaving] = useState(false)

  function save() {
    if (!name.trim()) return
    setSaving(true)
    const payload = { name: name.trim(), phone: phone||undefined, email: email||undefined, side: side as Guest['side'], group, rsvp_status: rsvp as Guest['rsvp_status'], food_preference: food||undefined, invitation_sent: inviteSent, created_at: new Date().toISOString() }
    const all = ls()
    if (guest?.id) { ss(all.map(g => g.id===guest.id ? {...g,...payload} : g)) } else { ss([{...payload,id:crypto.randomUUID()},...all]) }
    setSaving(false); onSaved()
  }

  return (
    <DialogContent>
      <DialogHeader><DialogTitle>{guest ? 'Edit Guest' : 'Add Guest'}</DialogTitle></DialogHeader>
      <DialogBody className="space-y-3">
        <div className="space-y-1.5">
          <Label>Full name *</Label>
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="Guest name" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Phone</Label>
            <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 XXXXX XXXXX" />
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label>Side</Label>
            <Select value={side} onValueChange={setSide}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{SIDES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Group</Label>
            <Select value={group} onValueChange={setGroup}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{GUEST_GROUPS.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>RSVP</Label>
            <Select value={rsvp} onValueChange={setRsvp}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{RSVP.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Food preference</Label>
          <Input value={food} onChange={e => setFood(e.target.value)} placeholder="Veg, Non-veg, Jain..." />
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={inviteSent} onChange={e => setInviteSent(e.target.checked)} className="rounded border-gray-300 text-emerald-600" />
          <span className="text-sm text-gray-700">Invitation sent</span>
        </label>
      </DialogBody>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={save} disabled={saving || !name.trim()}>
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          {guest ? 'Save' : 'Add Guest'}
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}

export default function GuestsPage() {
  const [guests, setGuests] = useState<Guest[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterRSVP, setFilterRSVP] = useState('')
  const [filterSide, setFilterSide] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editGuest, setEditGuest] = useState<Guest | null>(null)

  function load() { setGuests(ls()); setLoading(false) }
  function deleteGuest(id: string) { ss(ls().filter(g => g.id!==id)); load() }

  useEffect(() => { load() }, [])

  const filtered = guests.filter(g => {
    if (search && !g.name.toLowerCase().includes(search.toLowerCase())) return false
    if (filterRSVP && g.rsvp_status !== filterRSVP) return false
    if (filterSide && g.side !== filterSide) return false
    return true
  })

  const confirmed = guests.filter(g => g.rsvp_status === 'Confirmed').length
  const pending = guests.filter(g => g.rsvp_status === 'Pending').length
  const declined = guests.filter(g => g.rsvp_status === 'Declined').length

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-5 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Guest List</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">{guests.length} total guests</p>
            </div>
            <Button onClick={() => { setEditGuest(null); setShowForm(true) }}>
              <Plus className="w-4 h-4" /> Add Guest
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Total', value: guests.length, icon: null, color: 'text-gray-700 dark:text-gray-300' },
              { label: 'Confirmed', value: confirmed, icon: CheckCircle, color: 'text-emerald-600' },
              { label: 'Pending', value: pending, icon: Clock, color: 'text-amber-600' },
              { label: 'Declined', value: declined, icon: XCircle, color: 'text-red-500' },
            ].map(({ label, value, icon: Icon, color }) => (
              <Card key={label}>
                <CardContent className="p-4 flex items-center gap-3">
                  {Icon && <Icon className={`w-6 h-6 ${color} shrink-0`} />}
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                    <p className={`text-2xl font-bold ${color}`}>{value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <Input className="pl-8 h-8 text-sm" placeholder="Search guests..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select value={filterRSVP} onValueChange={setFilterRSVP}>
              <SelectTrigger className="w-32 h-8 text-sm"><SelectValue placeholder="All RSVP" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">All RSVP</SelectItem>
                {RSVP.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterSide} onValueChange={setFilterSide}>
              <SelectTrigger className="w-28 h-8 text-sm"><SelectValue placeholder="All sides" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">All sides</SelectItem>
                {SIDES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center h-20"><Loader2 className="w-5 h-5 text-emerald-500 animate-spin" /></div>
              ) : filtered.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">No guests found. Add your first guest!</p>
              ) : (
                <div className="divide-y divide-gray-50 dark:divide-gray-800">
                  <div className="grid grid-cols-6 px-4 py-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider bg-gray-50 dark:bg-gray-800/50 rounded-t-xl">
                    <span className="col-span-2">Name</span>
                    <span>Side</span>
                    <span>Group</span>
                    <span>RSVP</span>
                    <span>Invite</span>
                  </div>
                  {filtered.map(guest => (
                    <div key={guest.id} className="grid grid-cols-6 px-4 py-3 items-center hover:bg-gray-50 dark:hover:bg-gray-800/40 group">
                      <div className="col-span-2">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{guest.name}</p>
                        {guest.phone && <p className="text-xs text-gray-400 dark:text-gray-500">{guest.phone}</p>}
                      </div>
                      <span className="text-xs text-gray-600 dark:text-gray-400">{guest.side}</span>
                      <span className="text-xs text-gray-600 dark:text-gray-400">{guest.group}</span>
                      <span className={`text-xs font-medium ${guest.rsvp_status === 'Confirmed' ? 'text-emerald-600' : guest.rsvp_status === 'Declined' ? 'text-red-500' : 'text-amber-600'}`}>
                        {guest.rsvp_status}
                      </span>
                      <div className="flex items-center gap-1">
                        <span className={`text-xs ${guest.invitation_sent ? 'text-emerald-600' : 'text-gray-400'}`}>
                          {guest.invitation_sent ? '✓ Sent' : 'Pending'}
                        </span>
                        <div className="ml-auto flex gap-1 opacity-0 group-hover:opacity-100">
                          <button onClick={() => { setEditGuest(guest); setShowForm(true) }} className="p-1 text-gray-400 hover:text-gray-600"><Edit2 className="w-3 h-3" /></button>
                          <button onClick={() => deleteGuest(guest.id)} className="p-1 text-gray-400 hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
      <Dialog open={showForm} onOpenChange={setShowForm}>
        {showForm && <GuestForm guest={editGuest} onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); load() }} />}
      </Dialog>
    </div>
  )
}
