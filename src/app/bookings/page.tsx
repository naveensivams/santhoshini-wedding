'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Phone, Loader2, Trash2, Edit2, CheckCircle, AlertTriangle, Clock, BookOpen } from 'lucide-react'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BOOKING_CATEGORIES, BOOKING_STATUSES, EVENTS, WEDDING_DATE } from '@/lib/constants'
import { getBookingUrgency, getStatusColor, formatCurrency, formatDate, getDaysUntil } from '@/lib/utils'
import type { Booking } from '@/types'
import { createClient } from '@/lib/supabase/client'

const daysLeft = Math.max(0, Math.ceil((WEDDING_DATE.getTime() - Date.now()) / 86400000))

function urgencyBadge(urgency: string) {
  if (urgency === 'Critical' || urgency === 'Overdue') return 'red'
  if (urgency === 'Urgent') return 'orange'
  if (urgency === 'Upcoming') return 'yellow'
  return 'emerald'
}

function BookingCard({ booking, onEdit, onDelete, onMark }: { booking: Booking; onEdit: () => void; onDelete: () => void; onMark: (s: string) => void }) {
  const urgency = booking.status === 'Not Booked' || booking.status === 'Enquired' || booking.status === 'Negotiating'
    ? getBookingUrgency(booking.category, daysLeft)
    : 'On Track'

  const isOverdue = urgency === 'Critical' || urgency === 'Overdue'
  const catInfo = BOOKING_CATEGORIES.find(c => c.name === booking.category)
  const idealDate = new Date(WEDDING_DATE.getTime() - (catInfo?.leadTime || 60) * 86400000)

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white dark:bg-gray-900 rounded-xl border p-4 transition-shadow hover:shadow-md ${isOverdue ? 'border-red-200 dark:border-red-900 bg-red-50/30 dark:bg-red-950/20' : 'border-gray-100 dark:border-gray-800'}`}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-lg shrink-0">{catInfo?.icon || '📋'}</span>
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{booking.category}</p>
            {booking.vendor_name && <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{booking.vendor_name}{booking.event_name ? ` · ${booking.event_name}` : ''}</p>}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Badge variant={urgency === 'On Track' || booking.status === 'Confirmed' || booking.status === 'Booked' ? 'emerald' : 'red' as 'red'}>
            {booking.status}
          </Badge>
          {urgency !== 'On Track' && <Badge variant={urgencyBadge(urgency) as 'red'}>{urgency}</Badge>}
        </div>
      </div>

      <div className="flex items-center gap-2 mt-2">
        <div className="h-1.5 flex-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${booking.status === 'Confirmed' ? 'bg-green-500 w-full' : booking.status === 'Booked' ? 'bg-blue-500 w-4/5' : booking.status === 'Negotiating' ? 'bg-yellow-500 w-3/5' : booking.status === 'Enquired' ? 'bg-purple-400 w-2/5' : 'w-0'}`}
          />
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2">
          {booking.status === 'Not Booked' && (
            <Button size="sm" variant="outline" className="h-6 text-xs px-2" onClick={() => onMark('Enquired')}>
              Mark Enquired
            </Button>
          )}
          {booking.status === 'Enquired' && (
            <Button size="sm" variant="outline" className="h-6 text-xs px-2" onClick={() => onMark('Negotiating')}>
              Negotiating
            </Button>
          )}
          {(booking.status === 'Negotiating') && (
            <Button size="sm" className="h-6 text-xs px-2" onClick={() => onMark('Booked')}>
              Mark Booked ✓
            </Button>
          )}
          {booking.contact_phone && (
            <a href={`tel:${booking.contact_phone}`} className="flex items-center gap-1 text-xs text-gray-500 hover:text-emerald-600">
              <Phone className="w-3 h-3" /> {booking.contact_phone}
            </a>
          )}
        </div>
        <div className="flex items-center gap-1">
          {catInfo && (
            <span className="text-[10px] text-gray-400">
              Book by {formatDate(idealDate.toISOString().split('T')[0])}
            </span>
          )}
          <button onClick={onEdit} className="p-1 text-gray-400 hover:text-gray-600"><Edit2 className="w-3.5 h-3.5" /></button>
          <button onClick={onDelete} className="p-1 text-gray-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      </div>
    </motion.div>
  )
}

function BookingForm({ booking, onClose, onSaved }: { booking?: Booking | null; onClose: () => void; onSaved: () => void }) {
  const [category, setCategory] = useState(booking?.category || '')
  const [vendorName, setVendorName] = useState(booking?.vendor_name || '')
  const [status, setStatus] = useState<string>(booking?.status || 'Not Booked')
  const [eventId, setEventId] = useState(booking?.event_id || '')
  const [advance, setAdvance] = useState(String(booking?.advance_paid || 0))
  const [balance, setBalance] = useState(String(booking?.balance_due || 0))
  const [contactName, setContactName] = useState(booking?.contact_name || '')
  const [contactPhone, setContactPhone] = useState(booking?.contact_phone || '')
  const [notes, setNotes] = useState(booking?.notes || '')
  const [saving, setSaving] = useState(false)

  async function save() {
    if (!category) return
    setSaving(true)
    const selectedEvent = EVENTS.find(e => e.id === eventId)
    const payload = { category, vendor_name: vendorName||null, status, event_id: eventId||null, event_name: selectedEvent?.name||null, advance_paid: parseFloat(advance)||0, balance_due: parseFloat(balance)||0, contact_name: contactName||null, contact_phone: contactPhone||null, notes: notes||null, contract_signed: false, trial_scheduled: false }
    const sb = createClient()
    if (booking?.id) { await sb.from('bookings').update(payload).eq('id', booking.id) } else { await sb.from('bookings').insert({ ...payload, id: crypto.randomUUID() }) }
    setSaving(false); onSaved()
  }

  return (
    <DialogContent className="max-w-lg">
      <DialogHeader><DialogTitle>{booking ? 'Edit Booking' : 'Add Booking'}</DialogTitle></DialogHeader>
      <DialogBody className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Category *</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>{BOOKING_CATEGORIES.map(c => <SelectItem key={c.name} value={c.name}>{c.icon} {c.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{BOOKING_STATUSES.map(s => <SelectItem key={s} value={s as string}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Vendor name</Label>
          <Input value={vendorName} onChange={e => setVendorName(e.target.value)} placeholder="e.g. Sharma Photography" />
        </div>
        <div className="space-y-1.5">
          <Label>For event</Label>
          <Select value={eventId} onValueChange={setEventId}>
            <SelectTrigger><SelectValue placeholder="All events" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">All events</SelectItem>
              {EVENTS.map(e => <SelectItem key={e.id} value={e.id}>{e.icon} {e.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Advance paid (₹)</Label>
            <Input type="number" value={advance} onChange={e => setAdvance(e.target.value)} placeholder="0" />
          </div>
          <div className="space-y-1.5">
            <Label>Balance due (₹)</Label>
            <Input type="number" value={balance} onChange={e => setBalance(e.target.value)} placeholder="0" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Contact name</Label>
            <Input value={contactName} onChange={e => setContactName(e.target.value)} placeholder="Name" />
          </div>
          <div className="space-y-1.5">
            <Label>Contact phone</Label>
            <Input value={contactPhone} onChange={e => setContactPhone(e.target.value)} placeholder="+91 XXXXX XXXXX" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Notes</Label>
          <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any notes..." rows={2} />
        </div>
      </DialogBody>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={save} disabled={saving || !category}>
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          {booking ? 'Save Changes' : 'Add Booking'}
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editBooking, setEditBooking] = useState<Booking | null>(null)

  const confirmed = bookings.filter(b => b.status === 'Confirmed' || b.status === 'Booked').length
  const pending = bookings.filter(b => b.status !== 'Confirmed' && b.status !== 'Booked' && b.status !== 'Cancelled').length
  const overdue = bookings.filter(b => {
    if (b.status === 'Confirmed' || b.status === 'Booked' || b.status === 'Cancelled') return false
    const u = getBookingUrgency(b.category, daysLeft)
    return u === 'Critical' || u === 'Overdue'
  }).length

  async function load() {
    const { data } = await createClient().from('bookings').select('*').order('created_at', { ascending: false })
    setBookings((data || []) as Booking[]); setLoading(false)
  }
  async function markStatus(id: string, status: string) { await createClient().from('bookings').update({ status }).eq('id', id); load() }
  async function deleteBooking(id: string) { await createClient().from('bookings').delete().eq('id', id); load() }

  useEffect(() => {
    load()
    const sb = createClient()
    const sub = sb.channel('bookings-ch').on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, load).subscribe()
    return () => { sub.unsubscribe() }
  }, [])

  const sorted = [...bookings].sort((a, b) => {
    const order = ['Not Booked', 'Enquired', 'Negotiating', 'Booked', 'Confirmed', 'Cancelled']
    return order.indexOf(a.status) - order.indexOf(b.status)
  })

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-5 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Vendor Bookings</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Makeup, clothes, decoration, catering — every critical booking, tracked to confirmation.</p>
            </div>
            <Button onClick={() => { setEditBooking(null); setShowForm(true) }}>
              <Plus className="w-4 h-4" /> Add Booking
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Booked', value: `${Math.round(bookings.length ? (confirmed / bookings.length) * 100 : 0)}%`, sub: `${confirmed} of ${bookings.length} bookings`, icon: CheckCircle, color: 'text-emerald-600' },
              { label: 'Confirmed', value: confirmed, sub: 'vendors confirmed', icon: CheckCircle, color: 'text-blue-600' },
              { label: 'Pending', value: pending, sub: 'still to book', icon: Clock, color: 'text-amber-600' },
              { label: 'Overdue', value: overdue, sub: 'past ideal window', icon: AlertTriangle, color: 'text-red-600' },
            ].map(({ label, value, sub, icon: Icon, color }) => (
              <Card key={label}>
                <CardContent className="p-4 flex items-center gap-3">
                  <Icon className={`w-8 h-8 ${color} shrink-0`} />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
                    <p className="text-xs text-gray-400">{sub}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Booking list */}
          <div>
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">All bookings, most urgent first</h2>
            {loading ? (
              <div className="flex items-center justify-center h-40"><Loader2 className="w-6 h-6 text-emerald-500 animate-spin" /></div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No bookings yet. Add your first vendor booking!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {sorted.map(booking => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    onEdit={() => { setEditBooking(booking); setShowForm(true) }}
                    onDelete={() => deleteBooking(booking.id)}
                    onMark={(s) => markStatus(booking.id, s)}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        {showForm && <BookingForm booking={editBooking} onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); load() }} />}
      </Dialog>
    </div>
  )
}
