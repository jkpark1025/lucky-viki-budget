'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { getOrCreateRoom } from '@/app/actions/chat'

export default function StartChatButton({ productId }: { productId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleClick = async () => {
    setLoading(true)
    setError('')
    const result = await getOrCreateRoom(productId)
    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }
    router.push(`/chat/${result.roomId}`)
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleClick}
        disabled={loading}
        className="btn-pumpkin py-4 text-base disabled:opacity-60"
      >
        {loading ? '채팅방 불러오는 중...' : '💬 채팅하기'}
      </button>
      {error && (
        <p className="text-sm text-center" style={{ color: '#E8650A' }}>{error}</p>
      )}
    </div>
  )
}
