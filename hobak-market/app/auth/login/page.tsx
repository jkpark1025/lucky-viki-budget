'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useState, Suspense } from 'react'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const errorParam = searchParams.get('error')
  const messageParam = searchParams.get('message')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(errorParam || '')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('이메일 또는 비밀번호가 올바르지 않아요.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ background: 'var(--pumpkin-cream)' }}>

      <Link href="/" className="flex items-center gap-2 mb-8 no-underline">
        <span className="text-4xl">🎃</span>
        <span className="text-2xl font-black" style={{ color: 'var(--pumpkin-dark)' }}>
          호박마켓
        </span>
      </Link>

      <div className="card-pumpkin w-full max-w-sm p-8">
        <h2 className="text-2xl font-black mb-1" style={{ color: 'var(--brown-text)' }}>
          로그인
        </h2>
        <p className="text-sm mb-6" style={{ color: 'var(--brown-muted)' }}>
          반가워요! 이웃과 거래해요 🥕
        </p>

        {messageParam && (
          <div className="success-msg mb-4">{messageParam}</div>
        )}
        {error && (
          <div className="error-msg mb-4">{error}</div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1.5"
              style={{ color: 'var(--brown-text)' }}>
              이메일
            </label>
            <input
              type="email"
              className="input-pumpkin"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5"
              style={{ color: 'var(--brown-text)' }}>
              비밀번호
            </label>
            <input
              type="password"
              className="input-pumpkin"
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-pumpkin mt-2" disabled={loading}>
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <span className="text-sm" style={{ color: 'var(--brown-muted)' }}>
            아직 회원이 아니신가요?{' '}
          </span>
          <Link href="/auth/signup"
            className="text-sm font-bold no-underline"
            style={{ color: 'var(--pumpkin)' }}>
            회원가입
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
