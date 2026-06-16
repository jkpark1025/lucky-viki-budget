import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import { getChatRooms } from '@/app/actions/chat'
import { getAvatar } from '@/lib/avatar'

export default async function ChatListPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const rooms = await getChatRooms()

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--pumpkin-cream)' }}>
      <Header userEmail={user.email} />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
        <h1 className="text-2xl font-black mb-5" style={{ color: 'var(--brown-text)' }}>
          💬 채팅
        </h1>

        {rooms.length === 0 ? (
          <div className="card-pumpkin p-12 text-center">
            <div className="text-5xl mb-3">💭</div>
            <p className="font-bold mb-1" style={{ color: 'var(--brown-text)' }}>
              아직 채팅이 없어요
            </p>
            <p className="text-sm mb-5" style={{ color: 'var(--brown-muted)' }}>
              관심 있는 상품에서 채팅을 시작해보세요
            </p>
            <Link
              href="/products"
              className="btn-pumpkin no-underline inline-block px-8 py-2.5 text-sm"
              style={{ width: 'auto' }}
            >
              상품 보러가기
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {rooms.map((room) => {
              const otherAvatar = getAvatar(room.other_user?.avatar ?? '0')
              const thumb = room.product?.images?.[0]
              const time = room.last_message
                ? new Date(room.last_message.created_at).toLocaleDateString('ko-KR', {
                    month: 'short',
                    day: 'numeric',
                  })
                : ''

              return (
                <Link
                  key={room.id}
                  href={`/chat/${room.id}`}
                  className="card-pumpkin p-4 flex items-center gap-4 no-underline hover:shadow-md transition-shadow"
                >
                  {/* 썸네일 or 아바타 */}
                  <div className="relative flex-shrink-0">
                    {thumb ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={thumb}
                        alt=""
                        className="w-14 h-14 rounded-xl object-cover"
                      />
                    ) : (
                      <div
                        className="w-14 h-14 rounded-full flex items-center justify-center text-2xl"
                        style={{ background: otherAvatar.bg }}
                      >
                        {otherAvatar.emoji}
                      </div>
                    )}
                    {room.unread_count > 0 && (
                      <span
                        className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-white text-xs flex items-center justify-center font-bold"
                        style={{ background: 'var(--pumpkin)' }}
                      >
                        {room.unread_count > 9 ? '9+' : room.unread_count}
                      </span>
                    )}
                  </div>

                  {/* 내용 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-bold text-sm" style={{ color: 'var(--brown-text)' }}>
                        {room.other_user?.nickname ?? '알 수 없음'}
                      </span>
                      <span className="text-xs flex-shrink-0 ml-2" style={{ color: 'var(--brown-muted)' }}>
                        {time}
                      </span>
                    </div>
                    <p className="text-xs truncate mb-0.5" style={{ color: 'var(--brown-muted)' }}>
                      {room.product?.title ?? ''}
                    </p>
                    <p
                      className="text-sm truncate"
                      style={{
                        color: room.unread_count > 0 ? 'var(--brown-text)' : 'var(--brown-muted)',
                        fontWeight: room.unread_count > 0 ? 600 : 400,
                      }}
                    >
                      {room.last_message?.content ?? '아직 메시지가 없어요'}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
