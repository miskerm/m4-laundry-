'use client'

import { useState } from 'react'
import {
  ArrowRight,
  Check,
  ChevronDown,
  Clock3,
  MapPin,
  Menu,
  MessageCircle,
  Phone,
  Search,
  ShieldCheck,
  Sparkles,
  Truck,
  Share2,
  X,
} from 'lucide-react'

const referenceImage =
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Whirlpool%20Washer%205D%20_%20Sd%20Error%20Code%20%28Too%20Many%20Suds%29-tJTTLPlVmMN0DYu67RhkhXK2OLFmSq.jpeg'

const stepTemplate = [
  { label: 'Received', icon: Truck, color: '#7e8af2', detail: 'We have your clothes', image: '/images/tracker-received.png', imageAlt: 'Laundry pickup handoff between a customer and delivery worker' },
  { label: 'In process', icon: Sparkles, color: '#817ef2', detail: 'At our laundry studio', image: '/images/tracker-process.png', imageAlt: 'Clothes being washed in a washing machine' },
  { label: 'Ready', icon: ShieldCheck, color: '#7e94f2', detail: 'Quality checked and ready', image: '/images/tracker-ready.png', imageAlt: 'Freshly washed and folded shirts ready for return' },
  { label: 'Delivered', icon: Check, color: '#7e8cf2', detail: 'Returned to you', image: '/images/tracker-delivered.png', imageAlt: 'Courier delivering a package back to a customer' },
]
const statusOrder = ['received', 'processing', 'ready', 'delivered']

export default function Page() {
  const [trackingId, setTrackingId] = useState('M4-28491')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isTracking, setIsTracking] = useState(false)
  const [orderStatus, setOrderStatus] = useState('received')
  const [customerName, setCustomerName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [pickupDate, setPickupDate] = useState('')
  const [pickupTime, setPickupTime] = useState('')
  const [requestedReadyAt, setRequestedReadyAt] = useState('')
  const [serviceType, setServiceType] = useState('Wash & fold')
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState([{ itemName: '', quantity: 1 }])
  const [orderMessage, setOrderMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleTrack(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const code = trackingId.trim().toUpperCase()
    setTrackingId(code)
    setIsTracking(true)
    try {
      const response = await fetch(`/api/orders?code=${encodeURIComponent(code)}`)
      if (response.ok) {
        const data = await response.json()
        setOrderStatus(data.order.status)
        setOrderMessage(`${data.order.customerName}'s order is ${data.order.status === 'delivered' ? 'complete and delivered' : data.order.status === 'ready' ? 'ready to come back to you' : data.order.status === 'processing' ? 'being cleaned now' : 'received by M4 Laundry'}.`)
      } else {
        setOrderStatus('received')
      setOrderMessage('We could not find that tracking code. Check it and try again.')
      }
    } catch {
      setOrderStatus('received')
      setOrderMessage('We could not find that tracking code. Check it and try again.')
    }
    document.getElementById('tracking-result')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  async function handleCreateOrder(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setOrderMessage('')
    try {
      const response = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ customerName, phone, email, address, pickupDate, pickupTime, requestedReadyAt, serviceType, notes, specialInstructions: notes, items }) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      setTrackingId(data.trackingCode)
      setOrderStatus('received')
      setOrderMessage(`Order created. Save ${data.trackingCode} to track your clothes anytime.`)
      setItems([{ itemName: '', quantity: 1 }])
      setCustomerName('')
      setPhone('')
      setNotes('')
      setIsTracking(true)
      document.getElementById('tracking')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } catch (error) {
      setOrderMessage(error instanceof Error ? error.message : 'We could not create your order yet.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function updateOrderStatus(status: string) {
    if (!trackingId) return
    const response = await fetch('/api/orders', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ trackingCode: trackingId, status }) })
    if (response.ok) {
      const data = await response.json()
      setOrderStatus(data.order.status)
      setOrderMessage(`Status updated: ${status === 'delivered' ? 'your clothes have been delivered' : status === 'ready' ? 'your clothes are ready' : status === 'processing' ? 'your clothes are now being cleaned' : 'we received your clothes'}.`)
    }
  }

  function addItem() { setItems((current) => [...current, { itemName: '', quantity: 1 }]) }
  function updateItem(index: number, field: 'itemName' | 'quantity', value: string) { setItems((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: field === 'quantity' ? Math.max(1, Number(value) || 1) : value } : item)) }

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_10%_0%,#fff0f4_0,transparent_34%),radial-gradient(circle_at_90%_18%,#e7f3fb_0,transparent_28%),#fffdfb] text-[#162c46]">
      <header className="glass-panel sticky top-3 z-20 mx-3 rounded-2xl border-b border-white/70 bg-white/55 backdrop-blur-xl lg:mx-auto lg:max-w-[1184px]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 lg:px-8">
          <a href="#top" className="flex items-center gap-3" aria-label="M4 Laundry home">
            <span className="grid size-10 place-items-center rounded-full bg-[#7e94f2] text-lg font-black text-white">M4</span>
            <span className="text-xl font-black tracking-[-0.04em]">laundry<span className="text-[#7e8cf2]">.</span></span>
          </a>
          <nav className="hidden items-center gap-8 text-sm font-semibold text-[#6b7a8b] md:flex" aria-label="Primary navigation">
            <a className="text-[#7e98f2]" href="#top">Home</a>
            <a href="#services" className="transition-colors hover:text-[#7e98f2]">Services</a>
            <a href="#tracking" className="transition-colors hover:text-[#7e98f2]">Track order</a>
            <a href="#contact" className="transition-colors hover:text-[#7e98f2]">Contact</a>
          </nav>
          <a href="tel:+251990255212" className="hidden items-center gap-2 text-sm font-bold md:flex"><Phone className="size-4 text-[#7e98f2]" /> +251 990 255 212</a>
          <button className="rounded-xl p-2 md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}>{isMenuOpen ? <X /> : <Menu />}</button>
        </div>
        {isMenuOpen && <nav className="flex flex-col gap-4 border-t border-[#e8edf1] px-5 py-5 text-sm font-semibold md:hidden"><a href="#top" onClick={() => setIsMenuOpen(false)}>Home</a><a href="#services" onClick={() => setIsMenuOpen(false)}>Services</a><a href="#tracking" onClick={() => setIsMenuOpen(false)}>Track order</a><a href="#contact" onClick={() => setIsMenuOpen(false)}>Contact</a></nav>}
      </header>

      <section id="top" className="mx-auto grid max-w-6xl items-center gap-10 px-5 pb-16 pt-14 lg:grid-cols-[1fr_1.05fr] lg:px-8 lg:pb-24 lg:pt-20">
        <div>
          <p className="mb-5 inline-flex items-center gap-2 rounded-full bg-[#fff0f4] px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#5d6ee3]"><Sparkles className="size-4" /> Fresh clothes. Clear updates.</p>
          <h1 className="max-w-xl text-5xl font-black leading-[0.98] tracking-[-0.06em] text-[#142b47] sm:text-7xl">Laundry day, <span className="text-[#7e8cf2]">made easy.</span></h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-[#6b7a8b]">M4 Laundry picks up, cleans, and brings back your favorite clothes. Follow every step without guessing where your order is.</p>
          <div className="mt-8 flex flex-wrap gap-3"><a href="#tracking" className="inline-flex items-center gap-2 rounded-full bg-[#142b47] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#142b47]/15 transition-transform hover:-translate-y-0.5">Track my clothes <ArrowRight className="size-4" /></a><a href="#services" className="inline-flex items-center gap-2 rounded-full border border-[#d9e1e8] bg-white px-6 py-3.5 text-sm font-bold text-[#142b47]">Our services <ChevronDown className="size-4" /></a></div>
          <div className="mt-10 flex items-center gap-7 text-sm text-[#6b7a8b]"><span className="flex items-center gap-2"><ShieldCheck className="size-5 text-[#7e98f2]" /> Care you can trust</span><span className="flex items-center gap-2"><Truck className="size-5 text-[#7e98f2]" /> Free pickup</span></div>
        </div>
        <div className="glass-panel relative min-h-[390px] overflow-hidden rounded-[2rem] bg-[#f7d9e1]/70 shadow-2xl shadow-[#ef9bb1]/20 sm:min-h-[480px]">
          <img src={referenceImage} alt="Front-loading washing machine covered in white laundry suds" className="absolute inset-0 size-full object-cover object-top opacity-95" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#142b47]/80 via-transparent to-white/10" />
          <div className="glass-panel absolute bottom-7 left-7 right-7 rounded-2xl border-white/55 bg-white/45 p-5 shadow-xl"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#f27e9a]">Today&apos;s promise</p><p className="mt-2 text-2xl font-black tracking-tight text-[#142b47]">Clean clothes. On time.</p><p className="mt-1 text-sm text-[#6b7a8b]">We keep you in the loop from door to door.</p></div>
        </div>
      </section>

      <section id="request" className="mx-auto max-w-6xl px-5 py-16 lg:px-8 lg:py-24">
        <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#5a7ed6]">Start an order</p>
            <h2 className="mt-3 text-4xl font-black tracking-[-0.05em] text-[#142b47]">Tell us what to pick up.</h2>
            <p className="mt-4 max-w-md leading-7 text-[#6b7a8b]">Add clothes, blankets, or delicate pieces. We will give you a tracking code so you always know what is happening next.</p>
            <div className="mt-7 flex flex-col gap-3 text-sm font-bold text-[#142b47]"><span className="flex items-center gap-3"><span className="grid size-8 place-items-center rounded-full bg-[#eef1ff] text-[#6f83e8]">1</span> Add your items</span><span className="flex items-center gap-3"><span className="grid size-8 place-items-center rounded-full bg-[#eef1ff] text-[#6f83e8]">2</span> Save your tracking code</span><span className="flex items-center gap-3"><span className="grid size-8 place-items-center rounded-full bg-[#eef1ff] text-[#6f83e8]">3</span> We confirm when it is ready</span></div>
          </div>
          <form onSubmit={handleCreateOrder} className="glass-panel rounded-[2rem] bg-white/55 p-5 sm:p-8">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm font-bold text-[#142b47]">Your name<input required value={customerName} onChange={(event) => setCustomerName(event.target.value)} className="rounded-xl border border-white/70 bg-white/65 px-4 py-3 font-normal outline-none focus:border-[#7e98f2]" placeholder="Alex Johnson" /></label>
              <label className="flex flex-col gap-2 text-sm font-bold text-[#142b47]">Phone number<input required value={phone} onChange={(event) => setPhone(event.target.value)} className="rounded-xl border border-white/70 bg-white/65 px-4 py-3 font-normal outline-none focus:border-[#7e98f2]" placeholder="+251 990 255 212" /></label>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm font-bold text-[#142b47]">Email address<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="rounded-xl border border-white/70 bg-white/65 px-4 py-3 font-normal outline-none focus:border-[#7e98f2]" placeholder="alex@example.com" /></label>
              <label className="flex flex-col gap-2 text-sm font-bold text-[#142b47]">Pickup address<input required value={address} onChange={(event) => setAddress(event.target.value)} className="rounded-xl border border-white/70 bg-white/65 px-4 py-3 font-normal outline-none focus:border-[#7e98f2]" placeholder="12 Main Street" /></label>
              <label className="flex flex-col gap-2 text-sm font-bold text-[#142b47]">Preferred pickup date<input required type="date" value={pickupDate} onChange={(event) => setPickupDate(event.target.value)} className="rounded-xl border border-white/70 bg-white/65 px-4 py-3 font-normal outline-none focus:border-[#7e98f2]" /></label>
              <label className="flex flex-col gap-2 text-sm font-bold text-[#142b47]">Preferred pickup time<input required type="time" value={pickupTime} onChange={(event) => setPickupTime(event.target.value)} className="rounded-xl border border-white/70 bg-white/65 px-4 py-3 font-normal outline-none focus:border-[#7e98f2]" /></label>
              <label className="flex flex-col gap-2 text-sm font-bold text-[#142b47] sm:col-span-2">When do you need it back?<input type="datetime-local" value={requestedReadyAt} onChange={(event) => setRequestedReadyAt(event.target.value)} className="rounded-xl border border-white/70 bg-white/65 px-4 py-3 font-normal outline-none focus:border-[#7e98f2]" /></label>
            </div>
            <label className="mt-4 flex flex-col gap-2 text-sm font-bold text-[#142b47]">Service<select value={serviceType} onChange={(event) => setServiceType(event.target.value)} className="rounded-xl border border-white/70 bg-white/65 px-4 py-3 font-normal outline-none focus:border-[#7e98f2]"><option>Wash & fold</option><option>Dry cleaning</option><option>Blanket cleaning</option><option>Pickup & delivery</option></select></label>
            <div className="mt-5 flex flex-col gap-3"><div className="flex items-center justify-between"><p className="text-sm font-bold text-[#142b47]">Items to clean</p><button type="button" onClick={addItem} className="text-sm font-bold text-[#6f83e8]">+ Add another</button></div>{items.map((item, index) => <div key={index} className="flex gap-2"><input required value={item.itemName} onChange={(event) => updateItem(index, 'itemName', event.target.value)} className="min-w-0 flex-1 rounded-xl border border-white/70 bg-white/65 px-4 py-3 text-sm outline-none focus:border-[#7e98f2]" placeholder="e.g. 3 shirts or 1 blanket" /><input aria-label={`Quantity for item ${index + 1}`} type="number" min="1" value={item.quantity} onChange={(event) => updateItem(index, 'quantity', event.target.value)} className="w-20 rounded-xl border border-white/70 bg-white/65 px-3 py-3 text-sm outline-none focus:border-[#7e98f2]" /></div>)}</div>
            <label className="mt-4 flex flex-col gap-2 text-sm font-bold text-[#142b47]">Notes <textarea value={notes} onChange={(event) => setNotes(event.target.value)} className="min-h-20 rounded-xl border border-white/70 bg-white/65 px-4 py-3 font-normal outline-none focus:border-[#7e98f2]" placeholder="Any stains, special care, or pickup notes?" /></label>
            <button disabled={isSubmitting} className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-[#7e98f2] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#6b85e8] disabled:cursor-wait disabled:opacity-60" type="submit">{isSubmitting ? 'Creating your order...' : 'Create my laundry order'}</button>
          </form>
        </div>
      </section>

      <section id="tracking" className="bg-[#142b47] px-5 py-14 text-white lg:px-8 lg:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#7e98f2]">Order tracker</p>
              <h2 className="mt-3 text-4xl font-black tracking-[-0.05em] sm:text-5xl">Know where your clothes are.</h2>
              <p className="mt-4 max-w-md leading-7 text-[#b8c8d8]">Enter your order number and get a simple, real-time view of your laundry journey.</p>
              <form onSubmit={handleTrack} className="mt-7 flex max-w-md gap-2 rounded-2xl bg-white p-2">
                <label className="sr-only" htmlFor="tracking-id">Order number</label>
                <input id="tracking-id" value={trackingId} onChange={(event) => setTrackingId(event.target.value)} className="min-w-0 flex-1 rounded-xl px-3 text-sm font-semibold text-[#142b47] outline-none" placeholder="e.g. M4-28491" />
                <button className="inline-flex items-center gap-2 rounded-xl bg-[#7e98f2] px-4 py-3 text-sm font-bold text-white hover:bg-[#6b85e8]" type="submit"><Search className="size-4" /> Track</button>
              </form>
              <p className="mt-3 text-xs text-[#8fa5ba]">Try the sample order: M4-28491</p>
            </div>
            <div id="tracking-result" className="glass-panel rounded-[1.75rem] bg-white/55 p-5 text-[#142b47] sm:p-7">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#e5ebef] pb-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#8393a3]">Order {trackingId || 'M4-28491'}</p>
                  <h3 className="mt-2 text-2xl font-black">{orderStatus === 'delivered' ? 'Your laundry is complete.' : orderStatus === 'ready' ? 'Your clean clothes are ready.' : orderStatus === 'processing' ? 'Your clothes are being cleaned.' : 'Your order is in good hands.'}</h3>
                  {orderMessage && <p className="mt-2 max-w-md text-sm font-semibold text-[#34495f]">{orderMessage}</p>}
                </div>
                <span className="rounded-full bg-[#eef1ff] px-3 py-1.5 text-xs font-bold capitalize text-[#5d6ee3]">{orderStatus}</span>
              </div>
              <div className="grid gap-0 pt-7 sm:grid-cols-4">
                {stepTemplate.map((step, index) => {
                  const Icon = step.icon
                  const currentIndex = statusOrder.indexOf(orderStatus)
                  const complete = currentIndex >= index
                  const active = currentIndex === index
                  const preview = index === currentIndex + 1
                  const showingAll = orderStatus === 'delivered'
                  const visible = showingAll || active || preview
                  const stageClass = showingAll ? 'sm:col-span-1' : active ? 'sm:col-span-2' : preview ? 'sm:col-span-1' : 'hidden'
                  return (
                    <div key={step.label} className={`relative flex gap-4 pb-7 sm:block sm:pb-0 sm:pr-4 ${stageClass} ${active ? 'tracker-step-active' : ''} ${preview ? 'tracker-step-preview' : ''}`} aria-current={active ? 'step' : undefined} aria-hidden={!visible}>
                      <div className="flex items-center gap-3 sm:block">
                        <div className="relative size-16 shrink-0 overflow-hidden rounded-2xl border-2 bg-[#e5ebef] shadow-sm transition-all sm:size-full sm:aspect-[4/3]" style={{ borderColor: complete ? step.color : '#e5ebef', opacity: visible ? (active || showingAll ? 1 : 0.7) : 0, clipPath: preview && !showingAll ? 'inset(0 50% 0 0 round 1rem)' : undefined }}>
                          <img src={step.image} alt={step.imageAlt} className="size-full object-cover" />
                          <div className="absolute bottom-1 right-1 grid size-6 place-items-center rounded-full bg-white/90 text-[#5d6ee3] shadow-sm"><Icon className="size-3.5" /></div>
                        </div>
                        <div className="flex-1 sm:mt-3">
                          <p className="text-sm font-black" style={{ color: complete ? '#1a1b1c' : '#8798a8' }}>{step.label}</p>
                          <p className="mt-1 text-xs" style={{ color: complete ? '#292d2f' : '#8798a8' }}>{complete ? step.detail : 'Coming up next'}</p>
                        </div>
                      </div>
                      {index < stepTemplate.length - 1 && <div className="absolute bottom-0 left-5.5 h-12 w-0.5 bg-[#e5ebef] sm:left-5 sm:top-11 sm:h-0.5 sm:w-12"><span className={`tracker-connector-fill ${currentIndex > index ? 'tracker-connector-fill-visible' : ''}`} /></div>}
                    </div>
                  )
                })}
              </div>
              {orderStatus === 'delivered' && <div className="mt-6 flex items-center gap-3 rounded-2xl bg-[#eef1ff] px-4 py-3 text-sm font-black text-[#4d61d4] tracker-complete-badge"><span className="grid size-7 place-items-center rounded-full bg-[#7e98f2] text-white"><Check className="size-4" /></span> All steps completed — your laundry has been delivered.</div>}
              <div className="mt-6 border-t border-[#dbe3ea] pt-5">
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#6f83e8]">M4 team update</p>
                <div className="mt-3 flex flex-wrap gap-2">{statusOrder.map((status) => <button key={status} type="button" onClick={() => updateOrderStatus(status)} className="rounded-full border border-[#dbe3ea] bg-white/60 px-3 py-2 text-xs font-bold capitalize text-[#34495f] transition hover:border-[#7e98f2] hover:text-[#5d6ee3]">Mark {status}</button>)}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="mx-auto max-w-6xl px-5 py-16 lg:px-8 lg:py-24"><div className="flex flex-wrap items-end justify-between gap-6"><div><p className="text-sm font-bold uppercase tracking-[0.18em] text-[#7e99f2]">What we do</p><h2 className="mt-3 text-4xl font-black tracking-[-0.05em] text-[#142b47]">Services you will love.</h2></div><p className="max-w-sm text-sm leading-6 text-[#6b7a8b]">Every order is handled with a little extra care, so your clothes look and feel their best.</p></div><div className="mt-10 grid gap-5 md:grid-cols-3"><ServiceCard title="Wash & fold" text="Everyday essentials washed, dried, and folded neatly." icon="✦" /><ServiceCard title="Dry cleaning" text="Thoughtful care for suits, dresses, and delicate pieces." icon="◌" /><ServiceCard title="Pickup & delivery" text="We come to your door and return everything fresh." icon="↗" /></div></section>

      <section className="bg-[#fce7ed] px-5 py-16 lg:px-8 lg:py-20"><div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2"><div><p className="text-sm font-bold uppercase tracking-[0.18em] text-[#5a7ed6]">Why M4 Laundry</p><h2 className="mt-3 max-w-lg text-4xl font-black tracking-[-0.05em] text-[#142b47]">The easy way to stay fresh.</h2><p className="mt-4 max-w-lg leading-7 text-[#6b7a8b]">You deserve a laundry service that feels simple, friendly, and dependable. That is exactly what we built.</p><ul className="mt-7 grid gap-4 text-sm font-bold text-[#142b47] sm:grid-cols-2"><li className="flex items-center gap-3"><span className="grid size-7 place-items-center rounded-full bg-white text-[#7e9cf2]"><Check className="size-4" /></span> Clear order updates</li><li className="flex items-center gap-3"><span className="grid size-7 place-items-center rounded-full bg-white text-[#7e9cf2]"><Check className="size-4" /></span> Friendly local team</li><li className="flex items-center gap-3"><span className="grid size-7 place-items-center rounded-full bg-white text-[#7e9cf2]"><Check className="size-4" /></span> Careful garment handling</li><li className="flex items-center gap-3"><span className="grid size-7 place-items-center rounded-full bg-white text-[#7e9cf2]"><Check className="size-4" /></span> On-time delivery</li></ul></div><div className="glass-panel rounded-[2rem] bg-white/55 p-8 shadow-xl shadow-[#d65a7a]/10"><div className="flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#8393a3]">Need a hand?</p><h3 className="mt-2 text-2xl font-black text-[#142b47]">We are here to help.</h3></div><div className="grid size-12 place-items-center rounded-2xl bg-[#fff0f4] text-[#7e9cf2]"><MessageCircle /></div></div><p className="mt-4 text-sm leading-6 text-[#6b7a8b]">Have a question about your order or need to change your pickup? Give us a call.</p><a href="tel:+251990255212" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#142b47] px-5 py-3 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"><Phone className="size-4" /> Call us</a></div></div></section>

      <footer id="contact" className="bg-[#142b47] px-5 py-10 text-white lg:px-8"><div className="mx-auto flex max-w-6xl flex-col gap-8 sm:flex-row sm:items-end sm:justify-between"><div><div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-full bg-[#7ea7f2] text-sm font-black">M4</span><span className="text-xl font-black">laundry<span className="text-[#7ea7f2]">.</span></span></div><p className="mt-4 max-w-xs text-sm leading-6 text-[#9eb1c4]">Fresh clothes and fewer things on your mind.</p></div><div className="flex flex-col gap-3 text-sm text-[#b8c8d8] sm:items-end"><a href="tel:+251990255212" className="flex items-center gap-2 font-bold text-white"><Phone className="size-4 text-[#7ea8f2]" /> +251 990 255 212</a><span className="flex items-center gap-2"><MapPin className="size-4 text-[#7ea8f2]" /> Your neighborhood laundry team</span><div className="flex gap-3 pt-2"><Share2 className="size-4 text-[#7ea8f2]" /><MessageCircle className="size-4 text-[#7ea8f2]" /></div></div></div><div className="mx-auto mt-8 max-w-6xl border-t border-white/10 pt-5 text-xs text-[#71869b]">© 2026 M4 Laundry. Made fresh for you.</div></footer>
    </main>
  )
}

function ServiceCard({ title, text, icon }: { title: string; text: string; icon: string }) {
  const iconColors = ['#7e99f2', '#7e95f2', '#7e98f2']
  const colors = ['#7e99f2', '#7e95f2', '#7e98f2']
  const cardIndex = ['✦', '◌', '↗'].indexOf(icon)
  const color = colors[cardIndex] || '#7e98f2'
  
  return <article className="glass-panel rounded-[1.5rem] border-white/70 bg-white/45 p-7 transition-transform transition-shadow hover:-translate-y-1 hover:shadow-xl hover:shadow-[#142b47]/10"><div className="grid size-12 place-items-center rounded-2xl bg-[#fff0f4] text-2xl font-black" style={{ color }}>{icon}</div><h3 className="mt-6 text-xl font-black text-[#142b47]">{title}</h3><p className="mt-3 text-sm leading-6 text-[#6b7a8b]">{text}</p><a href="#tracking" className="mt-6 inline-flex items-center gap-2 text-sm font-black" style={{ color }}>Learn more <ArrowRight className="size-4" /></a></article>
}
