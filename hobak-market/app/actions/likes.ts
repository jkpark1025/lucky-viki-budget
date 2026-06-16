'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleLike(productId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 필요해요' }

  const { data: existing } = await supabase
    .from('likes')
    .select('id')
    .eq('user_id', user.id)
    .eq('product_id', productId)
    .maybeSingle()

  if (existing) {
    const { error } = await supabase.from('likes').delete().eq('id', existing.id)
    if (error) return { error: error.message }
  } else {
    const { error } = await supabase
      .from('likes')
      .insert({ user_id: user.id, product_id: productId })
    if (error) return { error: '내 상품에는 좋아요를 누를 수 없어요' }
  }

  revalidatePath(`/products/${productId}`)
  revalidatePath('/products')
  revalidatePath('/dashboard')
  return { success: true }
}
