'use client'
import { useState, useEffect } from 'react'
import { Plus, Loader2, Trash2, Edit2, Star, Phone } from 'lucide-react'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { VENDOR_CATEGORIES } from '@/lib/constants'
import type { Vendor } from '@/types'
import { createClient } from '@/lib/supabase/client'

function VendorForm({ vendor, onClose, onSaved }: { vendor?: Vendor | null; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState(vendor?.name || '')
  const [phone, setPhone] = useState(vendor?.phone || '')
  const [email, setEmail] = useState(vendor?.email || '')
  const [category, setCategory] = useState(vendor?.category || '')
  const [rating, setRating] = useState(String(vendor?.rating || ''))
  const [notes, setNotes] = useState(vendor?.notes || '')
  const [saving, setSaving] = useState(false)

  async function save() {
    if (!name.trim() || !category) return
    setSaving(true)
    const payload = { name: name.trim(), phone: phone||null, email: email||null, category, rating: rating ? parseInt(rating) : null, notes: notes||null }
    const sb = createClient()
    if (vendor?.id) { await sb.from('vendors').update(payload).eq('id', vendor.id) } else { await sb.from('vendors').insert({ ...payload, id: crypto.randomUUID() }) }
    setSaving(false); onSaved()
  }

  return (
    <DialogContent>
      <DialogHeader><DialogTitle>{vendor ? 'Edit Vendor' : 'Add Vendor'}</DialogTitle></DialogHeader>
      <DialogBody className="space-y-3">
        <div className="space-y-1.5">
          <Label>Vendor name *</Label>
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Sharma Studios" />
        </div>
        <div className="space-y-1.5">
          <Label>Category *</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
            <SelectContent>{VENDOR_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Phone</Label>
            <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 XXXXX XXXXX" />
          </div>
          <div className="space-y-1.5">
            <Label>Rating (1-5)</Label>
            <Input type="number" min="1" max="5" value={rating} onChange={e => setRating(e.target.value)} placeholder="5" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Email</Label>
          <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="vendor@example.com" />
        </div>
        <div className="space-y-1.5">
          <Label>Notes</Label>
          <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Pricing, terms, notes..." rows={2} />
        </div>
      </DialogBody>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={save} disabled={saving || !name.trim() || !category}>
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          {vendor ? 'Save' : 'Add Vendor'}
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editVendor, setEditVendor] = useState<Vendor | null>(null)

  async function load() {
    const { data } = await createClient().from('vendors').select('*').order('created_at', { ascending: false })
    setVendors((data || []) as Vendor[]); setLoading(false)
  }
  async function deleteVendor(id: string) { await createClient().from('vendors').delete().eq('id', id); load() }

  useEffect(() => {
    load()
    const sb = createClient()
    const sub = sb.channel('vendors-ch').on('postgres_changes', { event: '*', schema: 'public', table: 'vendors' }, load).subscribe()
    return () => { sub.unsubscribe() }
  }, [])

  const byCategory = VENDOR_CATEGORIES.filter(cat => vendors.some(v => v.category === cat))

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-5 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Vendor Directory</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">{vendors.length} vendors saved</p>
            </div>
            <Button onClick={() => { setEditVendor(null); setShowForm(true) }}>
              <Plus className="w-4 h-4" /> Add Vendor
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-40"><Loader2 className="w-6 h-6 text-emerald-500 animate-spin" /></div>
          ) : vendors.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-sm">No vendors yet. Add your first vendor!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {byCategory.map(cat => (
                <div key={cat}>
                  <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">{cat}</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {vendors.filter(v => v.category === cat).map(vendor => (
                      <Card key={vendor.id} className="card-hover group">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{vendor.name}</p>
                              <p className="text-xs text-gray-400 dark:text-gray-500">{vendor.category}</p>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                              <button onClick={() => { setEditVendor(vendor); setShowForm(true) }} className="p-1 text-gray-400 hover:text-gray-600"><Edit2 className="w-3.5 h-3.5" /></button>
                              <button onClick={() => deleteVendor(vendor.id)} className="p-1 text-gray-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                          </div>
                          {vendor.rating && (
                            <div className="flex items-center gap-0.5 mb-2">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} className={`w-3 h-3 ${i < vendor.rating! ? 'text-amber-400 fill-amber-400' : 'text-gray-200 dark:text-gray-700'}`} />
                              ))}
                            </div>
                          )}
                          {vendor.phone && (
                            <a href={`tel:${vendor.phone}`} className="flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-700">
                              <Phone className="w-3 h-3" /> {vendor.phone}
                            </a>
                          )}
                          {vendor.notes && <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 line-clamp-2">{vendor.notes}</p>}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
      <Dialog open={showForm} onOpenChange={setShowForm}>
        {showForm && <VendorForm vendor={editVendor} onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); load() }} />}
      </Dialog>
    </div>
  )
}
