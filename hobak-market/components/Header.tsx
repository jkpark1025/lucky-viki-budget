'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'

interface HeaderProps {
  userEmail?: string | null
}

export default function Header({ userEmail }: HeaderProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
    setLoading(false)
  }

  return (
    <header style={{ background: 'linear-gradient(90deg, #E8650A 0%, #C24A00 100%)' }}
      className="px-4 py-3 shadow-lg">
      <div className="max-w-screen-lg mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 no-underline">
            <span className="text-2xl">🎃</span>
            <span className="text-white font-black text-xl tracking-tight"
              style={{ textShadow: '1px 1px 0 rgba(0,0,0,0.3)' }}>
              호박마켓
            </span>
          </Link>
          <Link href="/products"
            className="text-white/80 hover:text-white text-sm font-semibold no-underline transition-colors hidden sm:block">
            판매글
          </Link>
        </div>

        <nav className="flex items-center gap-3">
          {userEmail ? (
            <>
              <span className="text-orange-100 text-sm hidden sm:block truncate max-w-[160px]">
                {userEmail}
              </span>
              <Link href="/dashboard"
                className="text-white text-sm font-semibold px-3 py-1.5 rounded-lg
                  hover:bg-white/20 transition-colors no-underline">
                마이페이지
              </Link>
              <button
                onClick={handleLogout}
                disabled={loading}
                className="bg-white/20 hover:bg-white/35 text-white text-sm font-semibold
                  px-3 py-1.5 rounded-lg transition-colors border border-white/30 cursor-pointer"
              >
                {loading ? '...' : '로그아웃'}
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login"
                className="text-white text-sm font-semibold px-3 py-1.5 rounded-lg
                  hover:bg-white/20 transition-colors no-underline">
                로그인
              </Link>
              <Link href="/auth/signup"
                className="bg-white text-orange-600 text-sm font-bold px-4 py-1.5
                  rounded-lg hover:bg-orange-50 transition-colors no-underline">
                회원가입
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
