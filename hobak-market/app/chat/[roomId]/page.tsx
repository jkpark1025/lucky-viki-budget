import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import ChatRoomView from '@/components/ChatRoomView'
import { markAsRead } from '@/app/actions/chat'
import { getAvatar } from '@/lib/avatar'

export default async function ChatRoomPage({
  params,
}: {
  params: Promise<{ roomId: string }>
}) {
  const { roomId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: room } = await supabase
    .from('chat_rooms')
    .select(`
      id, product_id, buyer_id, seller_id,
      product:products(id, title, images, status, price),
      buyer:profiles!chat_rooms_buyer_id_fkey(nickname, avatar),
      seller:profiles!chat_rooms_seller_id_fkey(nickname, avatar)
    `)
    .eq('id', roomId)
    .single()

  if (!room) notFound()

  const isParticipant = room.buyer_id === user.id || room.seller_id === user.id
  if (!isParticipant) notFound()

  const [{ data: messagesRaw }, { data: existingReview }] = await Promise.all([
    supabase
      .from('messages')
      .select('id, sender_id, content, created_at, read_at')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true }),
    supabase
      .from('reviews')
      .select('id')
      .eq('product_id', room.product_id)
      .eq('reviewer_id', user.id)
      .maybeSingle(),
  ])

  // 페이지 로드 시 기존 메시지 읽음 처리
  await markAsRead(roomId)

  const isBuyer = room.buyer_id === user.id
  const otherUser: { nickname: string; avatar: string } | null = isBuyer
    ? (room.seller as any)
    : (room.buyer as any)
  const otherAvatar = getAvatar(otherUser?.avatar ?? '0')

  return (
    <div className="chat-room-height flex flex-col" style={{ background: 'var(--pumpkin-cream)' }}>
      <Header userEmail={user.email} />

      {/* 채팅방 헤더 */}
      <div
        className="flex items-center gap-3 px-4 py-3 border-b flex-shrink-0"
        style={{ borderColor: 'var(--pumpkin-border)', background: 'white' }}
      >
        <Link
          href="/chat"
          className="text-xl no-underline flex-shrink-0"
          style={{ color: 'var(--brown-muted)' }}
        >
          ←
        </Link>
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-lg flex-shrink-0"
          style={{ background: otherAvatar.bg }}
        >
          {otherAvatar.emoji}
        </div>
        <span className="font-bold" style={{ color: 'var(--brown-text)' }}>
          {otherUser?.nickname ?? '채팅'}
        </span>
      </div>

      {/* 채팅 본문 (남은 높이 전부 차지) */}
      <div className="flex-1 overflow-hidden max-w-2xl mx-auto w-full">
        <ChatRoomView
          room={room as any}
          initialMessages={messagesRaw ?? []}
          currentUserId={user.id}
          alreadyReviewed={!!existingReview}
        />
      </div>
    </div>
  )
}
