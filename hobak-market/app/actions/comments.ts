'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addComment(productId: string, content: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 필요해요' }

  const trimmed = content.trim()
  if (!trimmed || trimmed.length > 500) return { error: '댓글 내용을 확인해 주세요 (1~500자)' }

  const { error } = await supabase
    .from('comments')
    .insert({ user_id: user.id, product_id: productId, content: trimmed })

  if (error) return { error: '내 상품에는 댓글을 달 수 없어요' }

  revalidatePath(`/products/${productId}`)
  revalidatePath('/dashboard')
  return { success: true }
}

export async function updateComment(commentId: string, content: string, productId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 필요해요' }

  const trimmed = content.trim()
  if (!trimmed || trimmed.length > 500) return { error: '댓글 내용을 확인해 주세요 (1~500자)' }

  const { error } = await supabase
    .from('comments')
    .update({ content: trimmed })
    .eq('id', commentId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath(`/products/${productId}`)
  return { success: true }
}

export async function deleteComment(commentId: string, productId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 필요해요' }

  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath(`/products/${productId}`)
  revalidatePath('/dashboard')
  return { success: true }
}
