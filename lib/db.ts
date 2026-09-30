import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

const globalForDb = globalThis as unknown as { laundryPool?: Pool }

export const pool = globalForDb.laundryPool ?? new Pool({ connectionString: process.env.DATABASE_URL })
if (process.env.NODE_ENV !== 'production') globalForDb.laundryPool = pool

export const db = drizzle(pool)

export type LaundryOrder = {
  id: number
  trackingCode: string
  customerName: string
  phone: string
  serviceType: string
  notes: string | null
  status: string
  readyConfirmed: boolean
  createdAt: Date
  updatedAt: Date
  email: string | null
  address: string | null
  pickupDate: string | null
  pickupTime: string | null
  requestedReadyAt: Date | null
  specialInstructions: string | null
}

export type LaundryItem = {
  id: number
  orderId: number
  itemName: string
  quantity: number
}

export async function getOrderByTrackingCode(trackingCode: string) {
  const result = await pool.query<LaundryOrder & { item_id: number | null; item_name: string | null; item_quantity: number | null }>(
    `SELECT o.id, o.tracking_code AS "trackingCode", o.customer_name AS "customerName", o.phone, o.service_type AS "serviceType", o.notes, o.status, o.ready_confirmed AS "readyConfirmed", o.created_at AS "createdAt", o.updated_at AS "updatedAt", o.email, o.address, o.pickup_date AS "pickupDate", o.pickup_time AS "pickupTime", o.requested_ready_at AS "requestedReadyAt", o.special_instructions AS "specialInstructions", i.id AS item_id, i.item_name, i.quantity AS item_quantity
     FROM laundry_orders o LEFT JOIN laundry_order_items i ON i.order_id = o.id
     WHERE o.tracking_code = $1 ORDER BY i.id`,
    [trackingCode],
  )
  if (!result.rows.length) return null
  const first = result.rows[0]
  return {
    order: first,
    items: result.rows.filter((row) => row.item_id).map((row) => ({ id: row.item_id!, orderId: first.id, itemName: row.item_name!, quantity: row.item_quantity! })),
  }
}

export async function getAllLaundryOrders() {
  const result = await pool.query<LaundryOrder & { items: { itemName: string; quantity: number }[] }>(
    `SELECT o.id, o.tracking_code AS "trackingCode", o.customer_name AS "customerName", o.phone, o.service_type AS "serviceType", o.notes, o.status, o.ready_confirmed AS "readyConfirmed", o.created_at AS "createdAt", o.updated_at AS "updatedAt", o.email, o.address, o.pickup_date AS "pickupDate", o.pickup_time AS "pickupTime", o.requested_ready_at AS "requestedReadyAt", o.special_instructions AS "specialInstructions", COALESCE(json_agg(json_build_object('itemName', i.item_name, 'quantity', i.quantity) ORDER BY i.id) FILTER (WHERE i.id IS NOT NULL), '[]') AS items
     FROM laundry_orders o LEFT JOIN laundry_order_items i ON i.order_id = o.id
     GROUP BY o.id ORDER BY o.created_at DESC`,
  )
  return result.rows
}

export async function createLaundryOrder(input: { customerName: string; phone: string; serviceType: string; notes?: string; email?: string; address?: string; pickupDate?: string; pickupTime?: string; requestedReadyAt?: string; specialInstructions?: string; items: { itemName: string; quantity: number }[] }) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const trackingCode = `M4-${Math.floor(10000 + Math.random() * 90000)}`
    const orderResult = await client.query<LaundryOrder>(
      `INSERT INTO laundry_orders (tracking_code, customer_name, phone, service_type, notes, email, address, pickup_date, pickup_time, requested_ready_at, special_instructions) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id, tracking_code AS "trackingCode", customer_name AS "customerName", phone, service_type AS "serviceType", notes, status, ready_confirmed AS "readyConfirmed", created_at AS "createdAt", updated_at AS "updatedAt", email, address, pickup_date AS "pickupDate", pickup_time AS "pickupTime", requested_ready_at AS "requestedReadyAt", special_instructions AS "specialInstructions"`,
      [trackingCode, input.customerName, input.phone, input.serviceType, input.notes || null, input.email || null, input.address || null, input.pickupDate || null, input.pickupTime || null, input.requestedReadyAt || null, input.specialInstructions || null],
    )
    for (const item of input.items) {
      await client.query('INSERT INTO laundry_order_items (order_id, item_name, quantity) VALUES ($1, $2, $3)', [orderResult.rows[0].id, item.itemName, item.quantity])
    }
    await client.query('COMMIT')
    return trackingCode
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}
