'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'

interface Props {
  productId: string
}

export default function ProductActions({ productId }: Props) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm('정말 삭제할까요? 삭제하면 되돌릴 수 없어요.')) return

    setDeleting(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId)

    if (error) {
      alert('삭제 중 오류가 발생했어요. 다시 시도해주세요.')
      setDeleting(false)
      return
    }

    router.push('/products')
    router.refresh()
  }

  return (
    <div className="flex gap-2">
      <Link
        href={`/products/${productId}/edit`}
        className="no-underline text-sm font-bold px-4 py-2 rounded-xl border-2 transition-all"
        style={{
          color: 'var(--pumpkin)',
          borderColor: 'var(--pumpkin-border)',
          background: '#fff',
        }}
      >
        수정
      </Link>
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="text-sm font-bold px-4 py-2 rounded-xl border-2 transition-all cursor-pointer"
        style={{
          color: '#CC2200',
          borderColor: '#FFCCCC',
          background: '#FFF5F5',
        }}
      >
        {deleting ? '삭제 중...' : '삭제'}
      </button>
    </div>
  )
}
