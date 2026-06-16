import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Header from '@/components/Header'
import ProfileEditForm from './ProfileEditForm'
import Link from 'next/link'

export default async function ProfileEditPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('nickname, avatar, bio')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--pumpkin-cream)' }}>
      <Header userEmail={user.email} />

      <main className="flex-1 max-w-md mx-auto w-full px-4 py-6">
        <Link href="/dashboard"
          className="inline-flex items-center gap-1 text-sm mb-5 no-underline font-semibold"
          style={{ color: 'var(--brown-muted)' }}>
          ← 마이페이지로
        </Link>

        <div className="card-pumpkin p-6">
          <h1 className="text-2xl font-black mb-6" style={{ color: 'var(--brown-text)' }}>
            내 프로필 편집
          </h1>
          <ProfileEditForm
            initialAvatar={profile?.avatar ?? '0'}
            initialBio={profile?.bio ?? ''}
            initialNickname={profile?.nickname ?? ''}
          />
        </div>

        <div className="mt-4 text-center">
          <Link href={`/users/${user.id}`}
            className="text-sm no-underline font-semibold"
            style={{ color: 'var(--pumpkin)' }}>
            내 공개 프로필 보기 →
          </Link>
        </div>
      </main>
    </div>
  )
}
