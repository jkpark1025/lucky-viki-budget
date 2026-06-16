'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toggleLike } from '@/app/actions/likes'

interface LikeButtonProps {
  productId: string
  initialCount: number
  initialLiked: boolean
  isLoggedIn: boolean
}

export default function LikeButton({ productId, initialCount, initialLiked, isLoggedIn }: LikeButtonProps) {
  const [isPending, startTransition] = useTransition()
  const [liked, setLiked] = useState(initialLiked)
  const [count, setCount] = useState(initialCount)
  const router = useRouter()

  useEffect(() => {
    setLiked(initialLiked)
    setCount(initialCount)
  }, [initialLiked, initialCount])

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isLoggedIn) {
      router.push('/auth/login')
      return
    }

    const next = !liked
    setLiked(next)
    setCount(next ? count + 1 : count - 1)

    startTransition(async () => {
      const result = await toggleLike(productId)
      if (result?.error) {
        setLiked(!next)
        setCount(!next ? count + 1 : count - 1)
      }
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="flex items-center gap-2 rounded-xl font-bold transition-all px-5 py-3 text-sm"
      style={liked
        ? { background: '#FFF0F0', color: '#E05050', border: '2px solid #FFAAAA' }
        : { background: 'var(--pumpkin-pale)', color: 'var(--brown-muted)', border: '2px solid var(--pumpkin-border)' }
      }
    >
      <span style={{ fontSize: '1.1rem' }}>{liked ? '❤️' : '🤍'}</span>
      <span>{count > 0 ? `${count}명이 좋아해요` : '좋아요'}</span>
    </button>
  )
}
