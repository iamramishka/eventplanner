"use client"
import React, { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

export default function ResetPage() {
  const params = useSearchParams()
  const router = useRouter()
  const [token, setToken] = useState(params?.get('token') || '')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    const res = await fetch('/api/auth/reset-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, password }) })
    const json = await res.json()
    if (json.ok) { setStatus('done'); setTimeout(() => router.push('/login'), 1200) }
    else setStatus(json.error || 'error')
  }

  return (
    <div style={{ maxWidth: 480, margin: '3rem auto', padding: 16 }}>
      <h2>Reset password</h2>
      <form onSubmit={submit}>
        <label>
          Token
          <input value={token} onChange={(e) => setToken(e.target.value)} />
        </label>
        <br />
        <label>
          New password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        <br />
        <button type="submit">Reset password</button>
      </form>
      {status && <div style={{ marginTop: 12 }}>{String(status)}</div>}
    </div>
  )
}
