'use client'

import { useState } from 'react'
import { submitReview } from '@/app/actions/reviews'

interface ReviewFormProps {
  productId: string
  roomId: string
  revieweeId: string
  revieweeName: string
  alreadyReviewed: boolean
}

export default function ReviewForm({
  productId,
  roomId,
  revieweeId,
  revieweeName,
  alreadyReviewed,
}: ReviewFormProps) {
  const [rating, setRating] = useState<'positive' | 'negative' | null>(null)
  const [content, setContent] = useState('')
  const [done, setDone] = useState(alreadyReviewed)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (done) {
    return (
      <div
        className="px-4 py-3 border-t text-center text-sm font-semibold"
        style={{
          borderColor: 'var(--pumpkin-border)',
          background: 'var(--pumpkin-pale)',
          color: 'var(--brown-muted)',
        }}
      >
        ✅ {revieweeName}님에게 거래 후기를 남겼어요
      </div>
    )
  }

  const handleSubmit = async () => {
    if (!rating || loading) return
    setLoading(true)
    setError('')
    const result = await submitReview(productId, roomId, revieweeId, rating, content)
    if (result.error) {
      setError(result.error)
    } else {
      setDone(true)
    }
    setLoading(false)
  }

  return (
    <div
      className="px-4 py-4 border-t"
      style={{ borderColor: 'var(--pumpkin-border)', background: 'var(--pumpkin-pale)' }}
    >
      <p className="text-sm font-bold mb-3" style={{ color: 'var(--brown-text)' }}>
        🌟 {revieweeName}님과의 거래는 어떠셨나요?
      </p>

      <div className="flex gap-2 mb-3">
        <button
          onClick={() => setRating('positive')}
          className="flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition-all"
          style={
            rating === 'positive'
              ? { background: 'var(--pumpkin)', color: 'white', borderColor: 'var(--pumpkin)' }
              : { color: 'var(--pumpkin)', borderColor: 'var(--pumpkin-border)', background: 'white' }
          }
        >
          👍 좋아요
        </button>
        <button
          onClick={() => setRating('negative')}
          className="flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition-all"
          style={
            rating === 'negative'
              ? { background: '#888', color: 'white', borderColor: '#888' }
              : { color: '#999', borderColor: '#ddd', background: 'white' }
          }
        >
          👎 별로예요
        </button>
      </div>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="자세한 후기를 남겨보세요 (선택, 최대 300자)"
        rows={2}
        maxLength={300}
        className="w-full resize-none rounded-xl border px-3 py-2 text-sm focus:outline-none mb-3"
        style={{ borderColor: 'var(--pumpkin-border)', color: 'var(--brown-text)' }}
      />

      {error && (
        <p className="text-xs mb-2" style={{ color: '#E8650A' }}>{error}</p>
      )}

      <button
        onClick={handleSubmit}
        disabled={!rating || loading}
        className="btn-pumpkin w-full py-2.5 text-sm disabled:opacity-50"
      >
        {loading ? '저장 중...' : '후기 남기기'}
      </button>
    </div>
  )
}
