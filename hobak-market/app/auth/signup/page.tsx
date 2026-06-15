'use client'

import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useState } from 'react'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('비밀번호는 6자 이상이어야 해요.')
      return
    }

    setLoading(true)
    const supabase = createClient()

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nickname },
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    })

    if (error) {
      if (error.message.includes('already registered')) {
        setError('이미 가입된 이메일이에요. 로그인해 주세요.')
      } else {
        setError('회원가입 중 오류가 발생했어요. 다시 시도해주세요.')
      }
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
        style={{ background: 'var(--pumpkin-cream)' }}>
        <div className="card-pumpkin w-full max-w-sm p-8 text-center">
          <div className="text-5xl mb-4">📬</div>
          <h2 className="text-xl font-black mb-3" style={{ color: 'var(--brown-text)' }}>
            이메일을 확인해주세요!
          </h2>
          <p className="text-sm mb-6" style={{ color: 'var(--brown-muted)' }}>
            <strong>{email}</strong>로 인증 메일을 보냈어요.<br />
            링크를 클릭하면 가입이 완료돼요. 🎃
          </p>
          <Link href="/auth/login" className="btn-pumpkin text-center no-underline py-3 block">
            로그인 하러 가기
          </Link>
        </div>
      </div>
    )
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
          회원가입
        </h2>
        <p className="text-sm mb-6" style={{ color: 'var(--brown-muted)' }}>
          호박마켓에 오신 걸 환영해요! 🎃
        </p>

        {error && (
          <div className="error-msg mb-4">{error}</div>
        )}

        <form onSubmit={handleSignup} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1.5"
              style={{ color: 'var(--brown-text)' }}>
              닉네임
            </label>
            <input
              type="text"
              className="input-pumpkin"
              placeholder="동네에서 불릴 이름"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              required
              maxLength={20}
            />
          </div>

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
              placeholder="6자 이상 입력해주세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <button type="submit" className="btn-pumpkin mt-2" disabled={loading}>
            {loading ? '가입 중...' : '가입하기'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <span className="text-sm" style={{ color: 'var(--brown-muted)' }}>
            이미 계정이 있으신가요?{' '}
          </span>
          <Link href="/auth/login"
            className="text-sm font-bold no-underline"
            style={{ color: 'var(--pumpkin)' }}>
            로그인
          </Link>
        </div>
      </div>
    </div>
  )
}
