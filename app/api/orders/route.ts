import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { createLaundryOrder, getAllLaundryOrders, getOrderByTrackingCode } from '@/lib/db'

export async function GET(request: Request) {
  const code = new URL(request.url).searchParams.get('code')?.trim().toUpperCase()
  if (!code) {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) return NextResponse.json({ error: 'Admin sign-in required.' }, { status: 401 })
    return NextResponse.json({ orders: await getAllLaundryOrders() })
  }
  const result = await getOrderByTrackingCode(code)
  if (!result) return NextResponse.json({ error: 'We could not find that order. Check the code and try again.' }, { status: 404 })
  return NextResponse.json(result)
}

export async function PATCH(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return NextResponse.json({ error: 'Admin sign-in required.' }, { status: 401 })
  const body = await request.json()
  const code = String(body.trackingCode || '').trim().toUpperCase()
  const status = String(body.status || '').trim().toLowerCase()
  if (!code) return NextResponse.json({ error: 'Tracking code is required.' }, { status: 400 })
  if (!['received', 'processing', 'ready', 'delivered'].includes(status)) return NextResponse.json({ error: 'Invalid order status.' }, { status: 400 })
  const { pool } = await import('@/lib/db')
  const result = await pool.query('UPDATE laundry_orders SET ready_confirmed = $1, status = $2, updated_at = NOW() WHERE tracking_code = $3 RETURNING tracking_code AS "trackingCode", ready_confirmed AS "readyConfirmed", status', [status === 'ready' || status === 'delivered', status, code])
  if (!result.rowCount) return NextResponse.json({ error: 'Order not found.' }, { status: 404 })
  return NextResponse.json({ order: result.rows[0] })
}

export async function DELETE(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return NextResponse.json({ error: 'Admin sign-in required.' }, { status: 401 })
  const body = await request.json()
  const code = String(body.trackingCode || '').trim().toUpperCase()
  if (!code) return NextResponse.json({ error: 'Tracking code is required.' }, { status: 400 })
  const { pool } = await import('@/lib/db')
  const result = await pool.query('DELETE FROM laundry_orders WHERE tracking_code = $1 AND status = $2 RETURNING tracking_code', [code, 'delivered'])
  if (!result.rowCount) return NextResponse.json({ error: 'Only delivered orders can be deleted.' }, { status: 400 })
  return NextResponse.json({ deleted: code })
}

export async function POST(request: Request) {
  const body = await request.json()
  const customerName = String(body.customerName || '').trim()
  const phone = String(body.phone || '').trim()
  const serviceType = String(body.serviceType || '').trim()
  const email = String(body.email || '').trim()
  const address = String(body.address || '').trim()
  const pickupDate = String(body.pickupDate || '').trim()
  const pickupTime = String(body.pickupTime || '').trim()
  const requestedReadyAt = String(body.requestedReadyAt || '').trim()
  const specialInstructions = String(body.specialInstructions || '').trim()
  const items = Array.isArray(body.items)
    ? body.items.map((item: { itemName?: string; quantity?: number }) => ({ itemName: String(item.itemName || '').trim(), quantity: Math.max(1, Math.min(99, Number(item.quantity) || 1)) })).filter((item: { itemName: string }) => item.itemName)
    : []
  if (!customerName || !phone || !serviceType || !items.length) return NextResponse.json({ error: 'Add your name, phone, service, and at least one item.' }, { status: 400 })
  const trackingCode = await createLaundryOrder({ customerName, phone, serviceType, notes: String(body.notes || '').trim(), email, address, pickupDate, pickupTime, requestedReadyAt, specialInstructions, items })
  return NextResponse.json({ trackingCode }, { status: 201 })
}
