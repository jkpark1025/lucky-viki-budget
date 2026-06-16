import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Header from '@/components/Header'
import Link from 'next/link'

const STATUS_LABEL: Record<string, string> = { selling: '판매중', reserved: '예약중', sold: '거래완료' }
const STATUS_COLOR: Record<string, string> = { selling: '#5D8A3C', reserved: '#E8650A', sold: '#999' }

type ProductSnippet = {
  id: string
  title: string
  price: number
  status: string
  images: string[] | null
  category: string
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const nickname = user.user_metadata?.nickname || user.email?.split('@')[0] || '이웃'

  const [likedResult, commentedResult] = await Promise.all([
    supabase
      .from('likes')
      .select('product_id, created_at, product:products(id, title, price, status, images, category)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(6),
    supabase
      .from('comments')
      .select('product_id, created_at, product:products(id, title, price, status, images, category)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
  ])

  const likedItems = (likedResult.data ?? []) as Array<{ product_id: string; product: ProductSnippet }>
  const likedProducts = likedItems.map((item) => item.product).filter(Boolean)

  // 상품 중복 제거 (같은 상품에 댓글 여러 개일 수 있음)
  const seenIds = new Set<string>()
  const commentedItems = (commentedResult.data ?? []) as Array<{ product_id: string; product: ProductSnippet }>
  const commentedProducts = commentedItems
    .filter((item) => {
      if (seenIds.has(item.product_id)) return false
      seenIds.add(item.product_id)
      return true
    })
    .map((item) => item.product)
    .filter(Boolean)
    .slice(0, 6)

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--pumpkin-cream)' }}>
      <Header userEmail={user.email} />

      <main className="flex-1 max-w-screen-lg mx-auto w-full px-4 py-8">

        {/* 환영 배너 */}
        <div className="card-pumpkin p-6 mb-6"
          style={{ background: 'linear-gradient(135deg, #FFF3E8 0%, #FFF8F0 100%)' }}>
          <div className="flex items-center gap-3">
            <div className="text-4xl">🎃</div>
            <div>
              <p className="text-sm" style={{ color: 'var(--brown-muted)' }}>안녕하세요!</p>
              <p className="text-xl font-black" style={{ color: 'var(--pumpkin-dark)' }}>
                {nickname}님, 반가워요
              </p>
            </div>
          </div>
        </div>

        {/* 메뉴 카드 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="card-pumpkin p-4 text-center cursor-default opacity-60">
            <div className="text-3xl mb-2">📦</div>
            <div className="font-bold text-sm mb-0.5" style={{ color: 'var(--brown-text)' }}>내 판매글</div>
            <div className="text-xs" style={{ color: 'var(--brown-muted)' }}>준비 중</div>
          </div>
          <div className="card-pumpkin p-4 text-center">
            <div className="text-3xl mb-2">❤️</div>
            <div className="font-bold text-sm mb-0.5" style={{ color: 'var(--brown-text)' }}>관심 목록</div>
            <div className="text-xs font-semibold" style={{ color: 'var(--pumpkin)' }}>
              {likedProducts.length}개
            </div>
          </div>
          <div className="card-pumpkin p-4 text-center cursor-default opacity-60">
            <div className="text-3xl mb-2">💬</div>
            <div className="font-bold text-sm mb-0.5" style={{ color: 'var(--brown-text)' }}>채팅</div>
            <div className="text-xs" style={{ color: 'var(--brown-muted)' }}>준비 중</div>
          </div>
          <div className="card-pumpkin p-4 text-center cursor-default opacity-60">
            <div className="text-3xl mb-2">⭐</div>
            <div className="font-bold text-sm mb-0.5" style={{ color: 'var(--brown-text)' }}>거래 후기</div>
            <div className="text-xs" style={{ color: 'var(--brown-muted)' }}>준비 중</div>
          </div>
        </div>

        {/* 관심 목록 */}
        <section className="mb-8">
          <h2 className="font-black text-lg mb-4 flex items-center gap-2" style={{ color: 'var(--pumpkin-dark)' }}>
            ❤️ 내가 좋아요 누른 상품
          </h2>
          {likedProducts.length === 0 ? (
            <div className="card-pumpkin p-8 text-center">
              <p className="text-sm mb-2" style={{ color: 'var(--brown-muted)' }}>
                아직 좋아요 누른 상품이 없어요
              </p>
              <Link href="/products" className="text-sm font-bold no-underline" style={{ color: 'var(--pumpkin)' }}>
                상품 구경하기 →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {likedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>

        {/* 댓글 단 상품 */}
        <section className="mb-8">
          <h2 className="font-black text-lg mb-4 flex items-center gap-2" style={{ color: 'var(--pumpkin-dark)' }}>
            💬 내가 댓글 단 상품
          </h2>
          {commentedProducts.length === 0 ? (
            <div className="card-pumpkin p-8 text-center">
              <p className="text-sm mb-2" style={{ color: 'var(--brown-muted)' }}>
                아직 댓글 단 상품이 없어요
              </p>
              <Link href="/products" className="text-sm font-bold no-underline" style={{ color: 'var(--pumpkin)' }}>
                상품 구경하기 →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {commentedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>

        {/* 계정 정보 */}
        <div className="card-pumpkin p-6">
          <h3 className="font-black text-lg mb-4" style={{ color: 'var(--pumpkin-dark)' }}>
            계정 정보
          </h3>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between py-3 border-b"
              style={{ borderColor: 'var(--pumpkin-border)' }}>
              <span className="text-sm font-semibold" style={{ color: 'var(--brown-muted)' }}>닉네임</span>
              <span className="font-bold" style={{ color: 'var(--brown-text)' }}>{nickname}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b"
              style={{ borderColor: 'var(--pumpkin-border)' }}>
              <span className="text-sm font-semibold" style={{ color: 'var(--brown-muted)' }}>이메일</span>
              <span className="font-medium" style={{ color: 'var(--brown-text)' }}>{user.email}</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-sm font-semibold" style={{ color: 'var(--brown-muted)' }}>가입일</span>
              <span className="font-medium" style={{ color: 'var(--brown-text)' }}>
                {new Date(user.created_at).toLocaleDateString('ko-KR')}
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function ProductCard({ product }: { product: ProductSnippet }) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="card-pumpkin no-underline overflow-hidden hover:shadow-lg transition-shadow"
    >
      {/* 썸네일 */}
      <div
        className="w-full aspect-square flex items-center justify-center text-4xl overflow-hidden"
        style={{ background: 'var(--pumpkin-pale)' }}
      >
        {product.images?.[0]
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
          : '🎃'}
      </div>

      <div className="p-3">
        <span
          className="text-xs font-semibold px-1.5 py-0.5 rounded-full"
          style={{
            background: `${STATUS_COLOR[product.status]}18`,
            color: STATUS_COLOR[product.status],
          }}
        >
          {STATUS_LABEL[product.status]}
        </span>
        <p className="font-bold text-sm mt-1.5 truncate" style={{ color: 'var(--brown-text)' }}>
          {product.title}
        </p>
        <p className="font-black text-sm mt-0.5" style={{ color: product.price === 0 ? 'var(--leaf-green)' : 'var(--pumpkin)' }}>
          {product.price === 0 ? '나눔' : `${product.price.toLocaleString()}원`}
        </p>
      </div>
    </Link>
  )
}
