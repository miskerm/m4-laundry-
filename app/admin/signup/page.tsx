'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { signUp } from '@/lib/auth-client'

export default function AdminSignupPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const result = await signUp.email({ name, email, password })
    if (result.error) setError('Unable to create the admin account. Use a valid email and a stronger password.')
    else { router.push('/admin'); router.refresh() }
  }
  return <main className="min-h-screen bg-[radial-gradient(circle_at_10%_0%,#fff0f4_0,transparent_34%),radial-gradient(circle_at_90%_18%,#e7f3fb_0,transparent_28%),#fffdfb] px-5 py-16 text-[#142b47]"><div className="glass-panel mx-auto max-w-md rounded-[2rem] bg-white/60 p-8"><p className="text-sm font-bold uppercase tracking-[0.18em] text-[#5a7ed6]">M4 Laundry team</p><h1 className="mt-3 text-4xl font-black tracking-[-0.05em]">Create admin access</h1><form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-4"><label className="flex flex-col gap-2 text-sm font-bold">Name<input required value={name} onChange={(event) => setName(event.target.value)} className="rounded-xl border border-white/70 bg-white/70 px-4 py-3 font-normal outline-none" /></label><label className="flex flex-col gap-2 text-sm font-bold">Email<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="rounded-xl border border-white/70 bg-white/70 px-4 py-3 font-normal outline-none" /></label><label className="flex flex-col gap-2 text-sm font-bold">Password<input required minLength={8} type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="rounded-xl border border-white/70 bg-white/70 px-4 py-3 font-normal outline-none" /></label>{error && <p role="alert" className="text-sm font-semibold text-[#b42318]">{error}</p>}<button className="rounded-xl bg-[#7e98f2] px-5 py-3.5 text-sm font-bold text-white">Create account</button></form><a href="/admin/login" className="mt-5 block text-center text-sm font-bold text-[#5d6ee3]">Back to sign in</a></div></main>
}
