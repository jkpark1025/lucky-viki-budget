'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function BottomNav() {
  const pathname = usePathname()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (pathname.startsWith('/auth/')) return
    const supabase = createClient()
    const fetchState = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setIsLoggedIn(!!user)
      if (!user) return
      const { count } = await supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .is('read_at', null)
        .neq('sender_id', user.id)
      setUnreadCount(count ?? 0)
    }
    fetchState()
  }, [pathname])

  // 로그인/회원가입 페이지에서는 숨김
  if (pathname.startsWith('/auth/')) return null

  const tabs = [
    {
      href: '/',
      icon: '🏠',
      label: '홈',
      active: pathname === '/',
    },
    {
      href: '/products',
      icon: '🛒',
      label: '판매글',
      active: pathname.startsWith('/products'),
    },
    {
      href: '/chat',
      icon: '💬',
      label: '채팅',
      active: pathname.startsWith('/chat'),
      badge: unreadCount,
    },
    {
      href: isLoggedIn ? '/dashboard' : '/auth/login',
      icon: '👤',
      label: isLoggedIn ? '마이' : '로그인',
      active: pathname === '/dashboard' || pathname.startsWith('/profile') || pathname.startsWith('/users'),
    },
  ]

  return (
    <nav
      className="sm:hidden fixed bottom-0 left-0 right-0 z-50 flex border-t"
      style={{
        background: 'white',
        borderColor: 'var(--pumpkin-border)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {tabs.map((tab) => (
        <Link
          key={tab.label}
          href={tab.href}
          className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 no-underline relative"
          style={{ color: tab.active ? 'var(--pumpkin)' : 'var(--brown-muted)' }}
        >
          <span className="text-xl relative leading-none">
            {tab.icon}
            {tab.badge && tab.badge > 0 ? (
              <span
                className="absolute -top-1 -right-2 w-4 h-4 rounded-full text-white flex items-center justify-center font-bold"
                style={{ background: 'var(--pumpkin)', fontSize: '9px' }}
              >
                {tab.badge > 9 ? '9+' : tab.badge}
              </span>
            ) : null}
          </span>
          <span
            className="text-xs font-semibold"
            style={{ fontSize: '10px' }}
          >
            {tab.label}
          </span>
          {tab.active && (
            <span
              className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
              style={{ background: 'var(--pumpkin)' }}
            />
          )}
        </Link>
      ))}
    </nav>
  )
}
