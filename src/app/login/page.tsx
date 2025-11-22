'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { FaRobot } from 'react-icons/fa'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    await performLogin(email, password)
  }

  const performLogin = async (u: string, p: string) => {
    try {
      const result = await signIn('credentials', {
        email: u,
        password: p,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid credentials')
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err) {
        console.error(err)
      setError('An error occurred')
    }
  }

  const handleDemoLogin = async () => {
      try {
          const res = await fetch('/api/auth/demo-login', { method: 'POST' })
          if (!res.ok) throw new Error('Demo mode unavailable')
          const creds = await res.json()
          await performLogin(creds.email, creds.password)
      } catch (err) {
          setError('Demo login failed')
      }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 rounded-lg border bg-card p-8 shadow-sm">
        <h2 className="text-center text-3xl font-bold tracking-tight text-foreground">
          Sign in to DASH
        </h2>
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {error && (
            <div className="rounded bg-red-100 p-3 text-sm text-red-700">
              {error}
            </div>
          )}
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="relative block w-full rounded-md border border-input bg-transparent px-3 py-2 text-foreground placeholder:text-muted-foreground focus:z-10 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="relative block w-full rounded-md border border-input bg-transparent px-3 py-2 text-foreground placeholder:text-muted-foreground focus:z-10 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          <div className="space-y-3">
            <button
              type="submit"
              className="group relative flex w-full justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              Sign in
            </button>
            
            {/* Demo Login Button - Conditionally rendered via CSS or JS based on env isn't strictly possible client-side securely without exposing, but we can try fetch or just always show if configured */}
            <button
                type="button"
                onClick={handleDemoLogin}
                className="group relative flex w-full justify-center items-center gap-2 rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2"
            >
                <FaRobot /> Login as Demo User
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
