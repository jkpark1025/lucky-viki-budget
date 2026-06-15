'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'

const CATEGORIES = [
  '디지털/가전',
  '가구/인테리어',
  '의류/패션',
  '도서/음반',
  '스포츠/레저',
  '생활/주방',
  '식물/반려동물',
  '기타',
]

export default function NewProductPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [tradeType, setTradeType] = useState('직거래')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!category) {
      setError('카테고리를 선택해주세요.')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/auth/login')
      return
    }

    const { data, error: insertError } = await supabase
      .from('products')
      .insert({
        user_id: user.id,
        title: title.trim(),
        description: description.trim(),
        price: parseInt(price, 10),
        category,
        trade_type: tradeType,
      })
      .select('id')
      .single()

    if (insertError) {
      setError('등록 중 오류가 발생했어요. 다시 시도해주세요.')
      setLoading(false)
      return
    }

    router.push(`/products/${data.id}`)
    router.refresh()
  }

  const formatPrice = (val: string) => {
    const num = val.replace(/[^0-9]/g, '')
    return num
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--pumpkin-cream)' }}>
      {/* 헤더 */}
      <header style={{ background: 'linear-gradient(90deg, #E8650A 0%, #C24A00 100%)' }}
        className="px-4 py-3 shadow-lg">
        <div className="max-w-screen-lg mx-auto flex items-center gap-3">
          <Link href="/" className="text-white/80 hover:text-white transition-colors no-underline text-sm">
            ← 홈
          </Link>
          <span className="text-white/40">|</span>
          <span className="text-white font-bold">판매글 작성</span>
        </div>
      </header>

      <main className="flex-1 max-w-xl mx-auto w-full px-4 py-8">
        <div className="card-pumpkin p-6 sm:p-8">
          <h1 className="text-2xl font-black mb-6" style={{ color: 'var(--pumpkin-dark)' }}>
            🎃 판매글 작성
          </h1>

          {error && <div className="error-msg mb-4">{error}</div>}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* 제목 */}
            <div>
              <label className="block text-sm font-bold mb-1.5" style={{ color: 'var(--brown-text)' }}>
                제목 <span style={{ color: 'var(--pumpkin)' }}>*</span>
              </label>
              <input
                type="text"
                className="input-pumpkin"
                placeholder="글 제목을 입력해주세요"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                maxLength={60}
              />
              <p className="text-xs mt-1 text-right" style={{ color: 'var(--brown-muted)' }}>
                {title.length}/60
              </p>
            </div>

            {/* 카테고리 */}
            <div>
              <label className="block text-sm font-bold mb-1.5" style={{ color: 'var(--brown-text)' }}>
                카테고리 <span style={{ color: 'var(--pumpkin)' }}>*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className="px-3 py-1.5 rounded-full text-sm font-semibold border-2 transition-all cursor-pointer"
                    style={category === cat ? {
                      background: 'var(--pumpkin)',
                      color: '#fff',
                      borderColor: 'var(--pumpkin)',
                    } : {
                      background: '#fff',
                      color: 'var(--brown-muted)',
                      borderColor: 'var(--pumpkin-border)',
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* 거래 방식 */}
            <div>
              <label className="block text-sm font-bold mb-1.5" style={{ color: 'var(--brown-text)' }}>
                거래 방식 <span style={{ color: 'var(--pumpkin)' }}>*</span>
              </label>
              <div className="flex gap-2">
                {['직거래', '택배', '모두가능'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setTradeType(type)}
                    className="flex-1 px-3 py-2 rounded-full text-sm font-semibold border-2 transition-all cursor-pointer"
                    style={tradeType === type ? {
                      background: 'var(--pumpkin)',
                      color: '#fff',
                      borderColor: 'var(--pumpkin)',
                    } : {
                      background: '#fff',
                      color: 'var(--brown-muted)',
                      borderColor: 'var(--pumpkin-border)',
                    }}
                  >
                    {type === '직거래' ? '🏘️ 직거래' : type === '택배' ? '📦 택배' : '🤝 모두가능'}
                  </button>
                ))}
              </div>
            </div>

            {/* 가격 */}
            <div>
              <label className="block text-sm font-bold mb-1.5" style={{ color: 'var(--brown-text)' }}>
                가격 <span style={{ color: 'var(--pumpkin)' }}>*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  className="input-pumpkin pr-8"
                  placeholder="0"
                  value={price ? Number(price).toLocaleString() : ''}
                  onChange={(e) => setPrice(formatPrice(e.target.value))}
                  required
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-sm"
                  style={{ color: 'var(--brown-muted)' }}>
                  원
                </span>
              </div>
              {price && (
                <p className="text-xs mt-1" style={{ color: 'var(--brown-muted)' }}>
                  {Number(price).toLocaleString()}원
                </p>
              )}
            </div>

            {/* 설명 */}
            <div>
              <label className="block text-sm font-bold mb-1.5" style={{ color: 'var(--brown-text)' }}>
                설명 <span style={{ color: 'var(--pumpkin)' }}>*</span>
              </label>
              <textarea
                className="input-pumpkin resize-none"
                style={{ minHeight: '160px' }}
                placeholder={`판매하려는 물건에 대해 자세히 설명해주세요.\n\n예) 구입한 지 1년 됐고 상태 양호합니다. 직거래 선호해요.`}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                maxLength={2000}
              />
              <p className="text-xs mt-1 text-right" style={{ color: 'var(--brown-muted)' }}>
                {description.length}/2000
              </p>
            </div>

            {/* 버튼 */}
            <div className="flex gap-3 pt-2">
              <Link href="/"
                className="btn-outline text-center no-underline py-3 flex-1">
                취소
              </Link>
              <button type="submit" className="btn-pumpkin flex-1 py-3" disabled={loading}>
                {loading ? '등록 중...' : '등록하기'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
