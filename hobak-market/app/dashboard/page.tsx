import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Header from '@/components/Header'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const nickname = user.user_metadata?.nickname || user.email?.split('@')[0] || '이웃'

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--pumpkin-cream)' }}>
      <Header userEmail={user.email} />

      <main className="flex-1 max-w-screen-lg mx-auto w-full px-4 py-8">
        {/* 환영 배너 */}
        <div className="card-pumpkin p-6 mb-6"
          style={{ background: 'linear-gradient(135deg, #FFF3E8 0%, #FFF8F0 100%)' }}>
          <div className="flex items-center gap-3">
            <div className="text-4xl">🎃</div>
            <div>
              <p className="text-sm" style={{ color: 'var(--brown-muted)' }}>안녕하세요!</p>
              <p className="text-xl font-black" style={{ color: 'var(--pumpkin-dark)' }}>
                {nickname}님, 반가워요
              </p>
            </div>
          </div>
        </div>

        {/* 메뉴 카드 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { icon: '📦', label: '내 판매글', desc: '준비 중', disabled: true },
            { icon: '❤️', label: '관심 목록', desc: '준비 중', disabled: true },
            { icon: '💬', label: '채팅', desc: '준비 중', disabled: true },
            { icon: '⭐', label: '거래 후기', desc: '준비 중', disabled: true },
          ].map((item) => (
            <div key={item.label}
              className="card-pumpkin p-4 text-center cursor-default opacity-60">
              <div className="text-3xl mb-2">{item.icon}</div>
              <div className="font-bold text-sm mb-0.5" style={{ color: 'var(--brown-text)' }}>
                {item.label}
              </div>
              <div className="text-xs" style={{ color: 'var(--brown-muted)' }}>{item.desc}</div>
            </div>
          ))}
        </div>

        {/* 계정 정보 */}
        <div className="card-pumpkin p-6">
          <h3 className="font-black text-lg mb-4" style={{ color: 'var(--pumpkin-dark)' }}>
            계정 정보
          </h3>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between py-3 border-b"
              style={{ borderColor: 'var(--pumpkin-border)' }}>
              <span className="text-sm font-semibold" style={{ color: 'var(--brown-muted)' }}>닉네임</span>
              <span className="font-bold" style={{ color: 'var(--brown-text)' }}>{nickname}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b"
              style={{ borderColor: 'var(--pumpkin-border)' }}>
              <span className="text-sm font-semibold" style={{ color: 'var(--brown-muted)' }}>이메일</span>
              <span className="font-medium" style={{ color: 'var(--brown-text)' }}>{user.email}</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-sm font-semibold" style={{ color: 'var(--brown-muted)' }}>가입일</span>
              <span className="font-medium" style={{ color: 'var(--brown-text)' }}>
                {new Date(user.created_at).toLocaleDateString('ko-KR')}
              </span>
            </div>
          </div>
        </div>

        <p className="text-center text-sm mt-8" style={{ color: 'var(--brown-muted)' }}>
          🌿 더 많은 기능이 곧 추가될 예정이에요!
        </p>
      </main>
    </div>
  )
}
