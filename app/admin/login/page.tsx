'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from '@/lib/auth-client'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (event.nativeEvent.isComposing || (event as unknown as KeyboardEvent).keyCode === 229) return
    setLoading(true)
    setError('')
    const result = await signIn.email({ email, password })
    if (result.error) setError('Unable to sign in. Check your email and password.')
    else { router.push('/admin'); router.refresh() }
    setLoading(false)
  }

  return <main className="min-h-screen bg-[radial-gradient(circle_at_10%_0%,#fff0f4_0,transparent_34%),radial-gradient(circle_at_90%_18%,#e7f3fb_0,transparent_28%),#fffdfb] px-5 py-16 text-[#142b47]"><div className="glass-panel mx-auto max-w-md rounded-[2rem] bg-white/60 p-8"><p className="text-sm font-bold uppercase tracking-[0.18em] text-[#5a7ed6]">M4 Laundry team</p><h1 className="mt-3 text-4xl font-black tracking-[-0.05em]">Admin sign in</h1><p className="mt-3 text-sm leading-6 text-[#6b7a8b]">Sign in to mark clothes received, in process, ready, or delivered.</p><form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-4"><label className="flex flex-col gap-2 text-sm font-bold">Email<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="rounded-xl border border-white/70 bg-white/70 px-4 py-3 font-normal outline-none focus:border-[#7e98f2]" /></label><label className="flex flex-col gap-2 text-sm font-bold">Password<input required type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="rounded-xl border border-white/70 bg-white/70 px-4 py-3 font-normal outline-none focus:border-[#7e98f2]" /></label>{error && <p role="alert" className="text-sm font-semibold text-[#b42318]">{error}</p>}<button disabled={loading} className="rounded-xl bg-[#7e98f2] px-5 py-3.5 text-sm font-bold text-white disabled:opacity-60">{loading ? 'Signing in...' : 'Sign in securely'}</button></form><a href="/admin/signup" className="mt-5 block text-center text-sm font-bold text-[#5d6ee3]">Create an admin account</a></div></main>
}
