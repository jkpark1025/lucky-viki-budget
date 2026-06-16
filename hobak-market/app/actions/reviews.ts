'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitReview(
  productId: string,
  roomId: string,
  revieweeId: string,
  rating: 'positive' | 'negative',
  content: string
): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 필요해요' }

  const trimmedContent = content.trim()
  if (trimmedContent.length > 300) return { error: '후기는 300자 이내로 작성해 주세요' }

  const { error } = await supabase
    .from('reviews')
    .insert({
      product_id: productId,
      room_id: roomId,
      reviewer_id: user.id,
      reviewee_id: revieweeId,
      rating,
      content: trimmedContent || null,
    })

  if (error) {
    if (error.code === '23505') return { error: '이미 후기를 작성하셨어요' }
    return { error: error.message }
  }

  revalidatePath(`/chat/${roomId}`)
  revalidatePath(`/users/${revieweeId}`)
  return { success: true }
}

export type Review = {
  id: string
  rating: 'positive' | 'negative'
  content: string | null
  created_at: string
  reviewer: { nickname: string } | null
}

export async function getReviewsForUser(userId: string): Promise<Review[]> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('reviews')
    .select('id, rating, content, created_at, reviewer:profiles!reviews_reviewer_id_fkey(nickname)')
    .eq('reviewee_id', userId)
    .order('created_at', { ascending: false })

  return (data ?? []) as unknown as Review[]
}
