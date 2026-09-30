'use client'

import { useEffect, useMemo, useState } from 'react'
import { signOut } from '@/lib/auth-client'

const statuses = ['received', 'processing', 'ready', 'delivered']
type Order = {
  id: number
  trackingCode: string
  customerName: string
  phone: string
  email: string | null
  address: string | null
  serviceType: string
  status: string
  notes: string | null
  specialInstructions: string | null
  pickupDate: string | null
  pickupTime: string | null
  requestedReadyAt: string | null
  createdAt: string
  items: { itemName: string; quantity: number }[]
}

export default function AdminOrders({ email }: { email: string }) {
  const [orders, setOrders] = useState<Order[]>([])
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  async function loadOrders() {
    setLoading(true)
    const response = await fetch('/api/orders', { cache: 'no-store' })
    const data = await response.json()
    if (response.ok) setOrders(data.orders)
    else setMessage(data.error || 'Could not load orders.')
    setLoading(false)
  }

  useEffect(() => { loadOrders() }, [])

  async function deleteOrder(trackingCode: string) {
    if (!window.confirm(`Delete completed order ${trackingCode}? This cannot be undone.`)) return
    const response = await fetch('/api/orders', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ trackingCode }) })
    const data = await response.json()
    setMessage(response.ok ? `${trackingCode} was deleted.` : data.error)
    if (response.ok) { setSelectedId(null); loadOrders() }
  }

  async function updateStatus(trackingCode: string, status: string) {
    const response = await fetch('/api/orders', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ trackingCode, status }) })
    const data = await response.json()
    setMessage(response.ok ? `${trackingCode} is now ${status}.` : data.error)
    if (response.ok) loadOrders()
  }

  const filteredOrders = useMemo(() => orders.filter((order) => {
    const text = `${order.customerName} ${order.phone} ${order.email || ''} ${order.trackingCode}`.toLowerCase()
    return text.includes(query.toLowerCase()) && (statusFilter === 'all' || order.status === statusFilter)
  }), [orders, query, statusFilter])
  const counts = statuses.map((status) => ({ status, count: orders.filter((order) => order.status === status).length }))

  return <main className="min-h-screen bg-[#f5f7fb] px-4 py-6 text-[#142b47] sm:px-8 lg:px-10"><div className="mx-auto max-w-[1500px]"><header className="flex flex-wrap items-center justify-between gap-5"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-[#6f83e8]">M4 Laundry operations</p><h1 className="mt-2 text-4xl font-black tracking-[-0.06em]">Customer command center</h1><p className="mt-2 text-sm text-[#6b7a8b]">Every customer, garment, pickup window, and return deadline in one place.</p></div><div className="flex items-center gap-3"><span className="hidden rounded-full bg-white px-4 py-2 text-xs font-bold text-[#6b7a8b] shadow-sm sm:inline">{email}</span><button onClick={() => signOut().then(() => window.location.assign('/admin/login'))} className="rounded-xl bg-[#142b47] px-4 py-2.5 text-sm font-bold text-white">Sign out</button></div></header>
    <section className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-5"><div className="rounded-2xl bg-[#142b47] p-5 text-white shadow-lg"><p className="text-xs font-bold uppercase tracking-wider text-[#b8c8d8]">Total orders</p><p className="mt-2 text-3xl font-black">{orders.length}</p></div>{counts.map(({ status, count }) => <button key={status} onClick={() => setStatusFilter(status)} className="rounded-2xl border border-[#e3e9f0] bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5"><p className="text-xs font-bold uppercase tracking-wider text-[#8798a8]">{status}</p><p className="mt-2 text-3xl font-black">{count}</p></button>)}</section>
    <section className="mt-8 rounded-[2rem] border border-[#e3e9f0] bg-white p-4 shadow-sm sm:p-6"><div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"><div><h2 className="text-xl font-black">All customer orders</h2><p className="mt-1 text-sm text-[#8798a8]">Showing {filteredOrders.length} of {orders.length} records</p></div><div className="flex flex-col gap-3 sm:flex-row"><input value={query} onChange={(event) => setQuery(event.target.value)} className="rounded-xl border border-[#dbe3ea] px-4 py-3 text-sm outline-none focus:border-[#7e98f2]" placeholder="Search name, phone, email, code" /><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-xl border border-[#dbe3ea] px-4 py-3 text-sm capitalize outline-none focus:border-[#7e98f2]"><option value="all">All statuses</option>{statuses.map((status) => <option key={status}>{status}</option>)}</select><button onClick={loadOrders} className="rounded-xl bg-[#eef1ff] px-4 py-3 text-sm font-bold text-[#5d6ee3]">Refresh</button></div></div>{message && <p className="mt-4 rounded-xl bg-[#eef1ff] p-3 text-sm font-bold text-[#4d61d4]">{message}</p>}<div className="mt-5 overflow-x-auto"><table className="w-full min-w-[980px] border-separate border-spacing-y-2 text-left text-sm"><thead><tr className="text-xs uppercase tracking-wider text-[#8798a8]"><th className="px-3 py-2">Customer</th><th className="px-3 py-2">Clothes</th><th className="px-3 py-2">Pickup</th><th className="px-3 py-2">Return by</th><th className="px-3 py-2">Status</th><th className="px-3 py-2">Action</th></tr></thead><tbody>{loading ? <tr><td colSpan={6} className="p-8 text-center text-[#8798a8]">Loading customer records...</td></tr> : filteredOrders.map((order) => <tr key={order.id} className="bg-[#f8fafc]"><td className="rounded-l-xl px-3 py-4 align-top"><p className="font-black">{order.customerName}</p><p className="mt-1 text-xs text-[#6b7a8b]">{order.phone}</p><p className="text-xs text-[#6b7a8b]">{order.email || 'No email added'}</p><button onClick={() => setSelectedId(selectedId === order.id ? null : order.id)} className="mt-2 text-xs font-bold text-[#5d6ee3]">{selectedId === order.id ? 'Hide details' : 'View full profile'}</button></td><td className="px-3 py-4 align-top"><div className="flex max-w-[220px] flex-wrap gap-1">{order.items.map((item, index) => <span key={index} className="rounded-full bg-white px-2 py-1 text-xs font-semibold shadow-sm">{item.quantity}× {item.itemName}</span>)}</div><p className="mt-2 text-xs text-[#6b7a8b]">{order.serviceType}</p></td><td className="px-3 py-4 align-top"><p className="font-semibold">{order.pickupDate || 'Not scheduled'}</p><p className="text-xs text-[#6b7a8b]">{order.pickupTime || ''}</p></td><td className="px-3 py-4 align-top text-xs font-semibold">{order.requestedReadyAt ? new Date(order.requestedReadyAt).toLocaleString() : 'Flexible'}</td><td className="px-3 py-4 align-top"><select value={order.status} onChange={(event) => updateStatus(order.trackingCode, event.target.value)} className="rounded-lg border border-[#dbe3ea] bg-white px-2 py-2 text-xs font-bold capitalize outline-none"><option disabled value="">Choose</option>{statuses.map((status) => <option key={status}>{status}</option>)}</select><p className="mt-1 text-[11px] font-bold text-[#8798a8]">{order.trackingCode}</p></td><td className="rounded-r-xl px-3 py-4 align-top"><span className="rounded-full bg-[#eef1ff] px-2 py-1 text-xs font-bold capitalize text-[#5d6ee3]">{order.status}</span></td></tr>)}{!loading && !filteredOrders.length && <tr><td colSpan={6} className="p-10 text-center text-[#8798a8]">No matching customer orders.</td></tr>}</tbody></table></div>
      {selectedId && (() => { const order = orders.find((item) => item.id === selectedId); if (!order) return null; return <div className="mt-5 grid gap-4 rounded-2xl bg-[#142b47] p-5 text-white sm:grid-cols-2 lg:grid-cols-4"><div><p className="text-xs font-bold uppercase text-[#9eafff]">Address</p><p className="mt-1 text-sm">{order.address || 'Not provided'}</p></div><div><p className="text-xs font-bold uppercase text-[#9eafff]">Special instructions</p><p className="mt-1 text-sm">{order.specialInstructions || order.notes || 'None'}</p></div><div><p className="text-xs font-bold uppercase text-[#9eafff]">Order created</p><p className="mt-1 text-sm">{new Date(order.createdAt).toLocaleString()}</p></div><div><p className="text-xs font-bold uppercase text-[#9eafff]">Tracking code</p><p className="mt-1 text-sm font-black">{order.trackingCode}</p></div>{order.status === 'delivered' && <div className="sm:col-span-2 lg:col-span-4"><button onClick={() => deleteOrder(order.trackingCode)} className="rounded-xl bg-[#fff0f0] px-4 py-2.5 text-sm font-bold text-[#b74646] transition hover:bg-[#ffe0e0]">Delete completed order</button><p className="mt-2 text-xs text-[#b8c8d8]">Deletion is available only after the order is marked Delivered.</p></div>}</div> })()}</section></div></main>
}
