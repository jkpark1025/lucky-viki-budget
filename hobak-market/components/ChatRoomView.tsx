'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { sendMessage, markAsRead } from '@/app/actions/chat'
import ReviewForm from '@/components/ReviewForm'
import { getAvatar } from '@/lib/avatar'

type Message = {
  id: string
  sender_id: string
  content: string
  created_at: string
  read_at: string | null
}

type ProfileInfo = { nickname: string; avatar: string } | null

interface RoomInfo {
  id: string
  product_id: string
  buyer_id: string
  seller_id: string
  product: { id: string; title: string; images: string[]; status: string; price: number } | null
  buyer: ProfileInfo
  seller: ProfileInfo
}

interface ChatRoomViewProps {
  room: RoomInfo
  initialMessages: Message[]
  currentUserId: string
  alreadyReviewed: boolean
}

export default function ChatRoomView({
  room,
  initialMessages,
  currentUserId,
  alreadyReviewed,
}: ChatRoomViewProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  const isBuyer = room.buyer_id === currentUserId
  const otherUser = isBuyer ? room.seller : room.buyer
  const otherUserId = isBuyer ? room.seller_id : room.buyer_id
  const otherAvatar = getAvatar(otherUser?.avatar ?? '0')
  const isSold = room.product?.status === 'sold'

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'auto' })
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // 방에 들어오면 상대방 메시지 읽음 처리
  useEffect(() => {
    markAsRead(room.id)
  }, [room.id])

  // Supabase Realtime으로 새 메시지 실시간 수신
  useEffect(() => {
    const channel = supabase
      .channel(`room_${room.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${room.id}`,
        },
        (payload) => {
          const newMsg = payload.new as Message
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev
            return [...prev, newMsg]
          })
          // 상대가 보낸 메시지면 즉시 읽음 처리
          if (newMsg.sender_id !== currentUserId) {
            markAsRead(room.id)
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [room.id, currentUserId])

  const handleSend = async () => {
    const trimmed = input.trim()
    if (!trimmed || sending) return
    setSending(true)
    setError('')
    const result = await sendMessage(room.id, trimmed)
    if (result?.error) {
      setError(result.error)
    } else {
      setInput('')
    }
    setSending(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* 상품 요약 바 */}
      {room.product && (
        <div
          className="flex items-center gap-3 px-4 py-3 border-b flex-shrink-0"
          style={{ borderColor: 'var(--pumpkin-border)', background: 'var(--pumpkin-pale)' }}
        >
          {room.product.images?.[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={room.product.images[0]}
              alt={room.product.title}
              className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
            />
          ) : (
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
              style={{ background: 'var(--pumpkin-cream)' }}
            >
              🎃
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm truncate" style={{ color: 'var(--brown-text)' }}>
              {room.product.title}
            </p>
            <p className="text-xs" style={{ color: 'var(--pumpkin)' }}>
              {room.product.price === 0 ? '🤝 나눔' : `${room.product.price.toLocaleString()}원`}
              {isSold && (
                <span className="ml-2 font-bold" style={{ color: '#999' }}>
                  · 거래완료
                </span>
              )}
            </p>
          </div>
        </div>
      )}

      {/* 메시지 목록 */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {messages.length === 0 && (
          <p className="text-center text-sm py-10" style={{ color: 'var(--brown-muted)' }}>
            첫 메시지를 보내 거래를 시작해보세요! 👋
          </p>
        )}

        {messages.map((msg) => {
          const isMine = msg.sender_id === currentUserId
          const time = new Date(msg.created_at).toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
          })

          return (
            <div
              key={msg.id}
              className={`flex items-end gap-2 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {!isMine && (
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0"
                  style={{ background: otherAvatar.bg }}
                >
                  {otherAvatar.emoji}
                </div>
              )}
              <div className={`max-w-[70%] flex flex-col gap-1 ${isMine ? 'items-end' : 'items-start'}`}>
                <div
                  className={`px-3.5 py-2.5 text-sm leading-relaxed ${
                    isMine ? 'rounded-2xl rounded-br-sm' : 'rounded-2xl rounded-bl-sm'
                  }`}
                  style={
                    isMine
                      ? { background: 'var(--pumpkin)', color: 'white' }
                      : { background: '#F0EDE8', color: 'var(--brown-text)' }
                  }
                >
                  {msg.content}
                </div>
                <span className="text-xs px-1" style={{ color: 'var(--brown-muted)' }}>
                  {time}
                </span>
              </div>
            </div>
          )
        })}

        <div ref={bottomRef} />
      </div>

      {/* 거래 후기 (거래완료 상태일 때만 표시) */}
      {isSold && (
        <ReviewForm
          productId={room.product_id}
          roomId={room.id}
          revieweeId={otherUserId}
          revieweeName={otherUser?.nickname ?? '상대방'}
          alreadyReviewed={alreadyReviewed}
        />
      )}

      {/* 메시지 입력창 */}
      <div className="px-3 py-3 border-t flex-shrink-0" style={{ borderColor: 'var(--pumpkin-border)' }}>
        {error && (
          <p className="text-xs mb-2 text-center" style={{ color: '#E8650A' }}>{error}</p>
        )}
        <div className="flex gap-2 items-end">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="메시지 입력... (Enter 전송, Shift+Enter 줄바꿈)"
            rows={2}
            className="flex-1 resize-none rounded-xl border px-3 py-2.5 text-sm focus:outline-none"
            style={{ borderColor: 'var(--pumpkin-border)', color: 'var(--brown-text)' }}
          />
          <button
            onClick={handleSend}
            disabled={sending || !input.trim()}
            className="btn-pumpkin px-4 py-2.5 flex-shrink-0 text-sm disabled:opacity-50"
          >
            {sending ? '...' : '전송'}
          </button>
        </div>
      </div>
    </div>
  )
}
