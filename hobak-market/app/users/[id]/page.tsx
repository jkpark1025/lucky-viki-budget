import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import Link from 'next/link'
import { getAvatar } from '@/lib/avatar'
import { getReviewsForUser } from '@/app/actions/reviews'

const STATUS_LABEL: Record<string, string> = { selling: '판매중', reserved: '예약중', sold: '거래완료' }
const STATUS_COLOR: Record<string, string> = { selling: '#5D8A3C', reserved: '#E8650A', sold: '#999' }

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const [
    { data: { user } },
    { data: profile },
    { data: products },
    reviews,
  ] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from('profiles').select('nickname, avatar, bio').eq('id', id).single(),
    supabase
      .from('products')
      .select('id, title, price, category, status, created_at, images')
      .eq('user_id', id)
      .order('created_at', { ascending: false }),
    getReviewsForUser(id),
  ])

  if (!profile) notFound()

  const avatar = getAvatar(profile.avatar ?? '0')
  const isMe = user?.id === id

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--pumpkin-cream)' }}>
      <Header userEmail={user?.email} />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
        <Link href="/products"
          className="inline-flex items-center gap-1 text-sm mb-5 no-underline font-semibold"
          style={{ color: 'var(--brown-muted)' }}>
          ← 목록으로
        </Link>

        {/* 프로필 카드 */}
        <div className="card-pumpkin p-6 mb-5">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl flex-shrink-0"
              style={{ background: avatar.bg }}>
              {avatar.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-black mb-0.5" style={{ color: 'var(--brown-text)' }}>
                {profile.nickname}
              </h1>
              <p className="text-sm" style={{ color: 'var(--brown-muted)' }}>호박마켓 이웃</p>
            </div>
            {isMe && (
              <Link href="/profile/edit"
                className="text-sm font-bold no-underline px-3 py-1.5 rounded-xl border-2 transition-colors flex-shrink-0"
                style={{ color: 'var(--pumpkin)', borderColor: 'var(--pumpkin-border)', background: 'white' }}>
                ✏️ 편집
              </Link>
            )}
          </div>

          {profile.bio ? (
            <p className="text-sm leading-6 whitespace-pre-wrap" style={{ color: 'var(--brown-text)' }}>
              {profile.bio}
            </p>
          ) : isMe ? (
            <p className="text-sm" style={{ color: 'var(--brown-muted)' }}>
              아직 자기소개가 없어요.{' '}
              <Link href="/profile/edit" className="no-underline font-semibold" style={{ color: 'var(--pumpkin)' }}>
                소개 추가하기
              </Link>
            </p>
          ) : (
            <p className="text-sm" style={{ color: 'var(--brown-muted)' }}>자기소개가 없어요.</p>
          )}
        </div>

        {/* 거래 후기 */}
        {reviews.length > 0 && (() => {
          const positive = reviews.filter(r => r.rating === 'positive').length
          const negative = reviews.filter(r => r.rating === 'negative').length
          return (
            <div className="card-pumpkin p-5 mb-5">
              <h2 className="text-sm font-bold mb-3" style={{ color: 'var(--brown-muted)' }}>
                거래 후기 {reviews.length}개
              </h2>
              <div className="flex gap-3 mb-4">
                <div className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: '#5D8A3C' }}>
                  <span>👍</span>
                  <span>{positive}개</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: '#999' }}>
                  <span>👎</span>
                  <span>{negative}개</span>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                {reviews.slice(0, 5).map(review => (
                  <div key={review.id} className="flex items-start gap-2">
                    <span>{review.rating === 'positive' ? '👍' : '👎'}</span>
                    <div>
                      <p className="text-xs font-semibold mb-0.5" style={{ color: 'var(--brown-muted)' }}>
                        {(review.reviewer as any)?.nickname ?? '알 수 없음'}
                      </p>
                      {review.content && (
                        <p className="text-sm" style={{ color: 'var(--brown-text)' }}>{review.content}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })()}

        {/* 판매글 목록 */}
        <div className="flex items-baseline gap-2 mb-3">
          <h2 className="text-lg font-black" style={{ color: 'var(--pumpkin-dark)' }}>
            {isMe ? '내 판매글' : `${profile.nickname}님의 판매글`}
          </h2>
          <span className="text-sm" style={{ color: 'var(--brown-muted)' }}>
            총 {products?.length ?? 0}개
          </span>
        </div>

        {(!products || products.length === 0) ? (
          <div className="card-pumpkin py-16 text-center">
            <div className="text-5xl mb-3">🎃</div>
            <p className="font-bold mb-1" style={{ color: 'var(--brown-text)' }}>
              아직 판매글이 없어요
            </p>
            {isMe && (
              <Link href="/products/new"
                className="btn-pumpkin no-underline inline-block mt-5 px-8 py-2.5 text-sm"
                style={{ width: 'auto' }}>
                첫 판매글 올리기
              </Link>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-0 rounded-2xl overflow-hidden"
            style={{ border: '1.5px solid var(--pumpkin-border)' }}>
            {products.map((product, idx) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="no-underline bg-white hover:bg-orange-50 transition-colors px-4 py-4 flex items-center gap-4"
                style={idx !== products.length - 1 ? { borderBottom: '1px solid var(--pumpkin-border)' } : {}}
              >
                <div className="w-16 h-16 rounded-xl flex-shrink-0 overflow-hidden flex items-center justify-center text-2xl"
                  style={{ background: 'var(--pumpkin-pale)' }}>
                  {(product as { images?: string[] }).images?.[0]
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={(product as { images?: string[] }).images![0]} alt={product.title}
                        className="w-full h-full object-cover" />
                    : '🎃'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold truncate mb-1" style={{ color: 'var(--brown-text)' }}>
                    {product.title}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{
                        background: `${STATUS_COLOR[product.status]}18`,
                        color: STATUS_COLOR[product.status],
                      }}>
                      {STATUS_LABEL[product.status]}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--brown-muted)' }}>
                      {product.category}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--brown-muted)' }}>
                      {new Date(product.created_at).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                </div>
                <p className="font-black flex-shrink-0"
                  style={{ color: product.price === 0 ? 'var(--leaf-green)' : 'var(--brown-text)' }}>
                  {product.price === 0 ? '나눔' : `${product.price.toLocaleString()}원`}
                </p>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
