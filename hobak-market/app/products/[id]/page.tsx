import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import ProductActions from '@/components/ProductActions'

const STATUS_LABEL: Record<string, string> = { selling: '판매중', reserved: '예약중', sold: '거래완료' }
const STATUS_COLOR: Record<string, string> = { selling: '#5D8A3C', reserved: '#E8650A', sold: '#999' }

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: product }, { data: { user } }] = await Promise.all([
    supabase
      .from('products')
      .select('*, seller:profiles!products_user_id_profiles_fkey(nickname)')
      .eq('id', id)
      .single(),
    supabase.auth.getUser(),
  ])

  if (!product) notFound()

  const seller = product.seller as { nickname?: string } | null
  const sellerNickname = seller?.nickname ?? '알 수 없음'
  const isOwner = user?.id === product.user_id
  const isSold = product.status === 'sold'

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--pumpkin-cream)' }}>
      <Header userEmail={user?.email} />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">

        {/* 뒤로가기 */}
        <Link href="/products"
          className="inline-flex items-center gap-1 text-sm mb-5 no-underline font-semibold"
          style={{ color: 'var(--brown-muted)' }}>
          ← 목록으로
        </Link>

        {/* 메인 카드 */}
        <div className="card-pumpkin overflow-hidden mb-4">

          {/* 썸네일 영역 */}
          <div className="w-full flex items-center justify-center py-14"
            style={{ background: 'var(--pumpkin-pale)' }}>
            <span className="text-8xl">{isSold ? '📦' : '🎃'}</span>
          </div>

          <div className="p-6">
            {/* 상태 + 카테고리 */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                style={{
                  background: `${STATUS_COLOR[product.status]}20`,
                  color: STATUS_COLOR[product.status],
                  border: `1.5px solid ${STATUS_COLOR[product.status]}50`,
                }}>
                {STATUS_LABEL[product.status]}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full font-medium"
                style={{ background: '#F5F5F0', color: 'var(--brown-muted)' }}>
                {product.category}
              </span>
            </div>

            {/* 제목 */}
            <h1 className="text-2xl font-black mb-3 leading-snug" style={{ color: 'var(--brown-text)' }}>
              {product.title}
            </h1>

            {/* 가격 */}
            <p className="text-3xl font-black mb-1" style={{ color: 'var(--pumpkin)' }}>
              {product.price === 0
                ? '🤝 나눔'
                : `${product.price.toLocaleString()}원`}
            </p>
            <p className="text-xs mb-6" style={{ color: 'var(--brown-muted)' }}>
              {new Date(product.created_at).toLocaleDateString('ko-KR', {
                year: 'numeric', month: 'long', day: 'numeric',
              })} 등록
            </p>

            {/* 구분선 */}
            <div className="border-t mb-5" style={{ borderColor: 'var(--pumpkin-border)' }} />

            {/* 설명 */}
            <h2 className="text-sm font-bold mb-2" style={{ color: 'var(--brown-muted)' }}>
              상품 설명
            </h2>
            <p className="text-sm leading-7 whitespace-pre-wrap mb-6" style={{ color: 'var(--brown-text)' }}>
              {product.description}
            </p>

            {/* 구분선 */}
            <div className="border-t mb-5" style={{ borderColor: 'var(--pumpkin-border)' }} />

            {/* 판매자 정보 */}
            <h2 className="text-sm font-bold mb-3" style={{ color: 'var(--brown-muted)' }}>
              판매자 정보
            </h2>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full flex items-center justify-center text-lg font-black text-white flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, var(--pumpkin), var(--pumpkin-dark))' }}>
                  {sellerNickname[0]}
                </div>
                <div>
                  <p className="font-bold" style={{ color: 'var(--brown-text)' }}>
                    {sellerNickname}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--brown-muted)' }}>
                    호박마켓 이웃
                  </p>
                </div>
              </div>

              {isOwner && (
                <ProductActions productId={product.id} />
              )}
            </div>
          </div>
        </div>

        {/* 하단 버튼 영역 */}
        {isOwner ? (
          <div className="card-pumpkin p-4 text-center">
            <p className="text-sm mb-3" style={{ color: 'var(--brown-muted)' }}>
              내가 올린 판매글이에요
            </p>
            <Link href="/products" className="btn-outline no-underline text-center py-2.5 block">
              목록으로 돌아가기
            </Link>
          </div>
        ) : isSold ? (
          <div className="card-pumpkin p-4 text-center">
            <p className="text-sm font-bold" style={{ color: '#999' }}>
              이미 거래가 완료된 상품이에요
            </p>
          </div>
        ) : user ? (
          <button className="btn-pumpkin py-4 text-base" disabled>
            💬 채팅하기 (준비 중)
          </button>
        ) : (
          <Link href="/auth/login"
            className="btn-pumpkin text-center no-underline py-4 text-base block">
            로그인하고 채팅하기
          </Link>
        )}
      </main>
    </div>
  )
}
