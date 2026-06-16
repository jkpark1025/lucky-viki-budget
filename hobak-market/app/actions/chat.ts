'use server'

import { createClient } from '@/lib/supabase/server'

export async function getOrCreateRoom(productId: string): Promise<{ roomId?: string; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 필요해요' }

  const { data: product } = await supabase
    .from('products')
    .select('user_id')
    .eq('id', productId)
    .single()

  if (!product) return { error: '상품을 찾을 수 없어요' }
  if (product.user_id === user.id) return { error: '내 상품에는 채팅을 시작할 수 없어요' }

  const { data: existing } = await supabase
    .from('chat_rooms')
    .select('id')
    .eq('product_id', productId)
    .eq('buyer_id', user.id)
    .maybeSingle()

  if (existing) return { roomId: existing.id }

  const { data: newRoom, error } = await supabase
    .from('chat_rooms')
    .insert({ product_id: productId, buyer_id: user.id, seller_id: product.user_id })
    .select('id')
    .single()

  if (error) return { error: '채팅방을 만들 수 없어요' }
  return { roomId: newRoom.id }
}

export async function sendMessage(roomId: string, content: string): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 필요해요' }

  const trimmed = content.trim()
  if (!trimmed || trimmed.length > 1000) return { error: '메시지를 확인해 주세요 (1~1000자)' }

  const { error } = await supabase
    .from('messages')
    .insert({ room_id: roomId, sender_id: user.id, content: trimmed })

  if (error) return { error: error.message }
  return { success: true }
}

export async function markAsRead(roomId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('messages')
    .update({ read_at: new Date().toISOString() })
    .eq('room_id', roomId)
    .neq('sender_id', user.id)
    .is('read_at', null)
}

export type ChatRoomSummary = {
  id: string
  product_id: string
  buyer_id: string
  seller_id: string
  product: { title: string; images: string[] } | null
  other_user: { nickname: string; avatar: string } | null
  last_message: { content: string; created_at: string } | null
  unread_count: number
}

export async function getChatRooms(): Promise<ChatRoomSummary[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: rooms } = await supabase
    .from('chat_rooms')
    .select(`
      id, product_id, buyer_id, seller_id,
      product:products(title, images),
      buyer:profiles!chat_rooms_buyer_id_fkey(nickname, avatar),
      seller:profiles!chat_rooms_seller_id_fkey(nickname, avatar)
    `)
    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
    .order('created_at', { ascending: false })

  if (!rooms || rooms.length === 0) return []

  const roomIds = rooms.map((r: any) => r.id)

  const { data: allMessages } = await supabase
    .from('messages')
    .select('id, room_id, content, created_at, sender_id, read_at')
    .in('room_id', roomIds)
    .order('created_at', { ascending: true })

  const msgsByRoom = new Map<string, any[]>()
  for (const msg of allMessages ?? []) {
    if (!msgsByRoom.has(msg.room_id)) msgsByRoom.set(msg.room_id, [])
    msgsByRoom.get(msg.room_id)!.push(msg)
  }

  return rooms.map((room: any) => {
    const isBuyer = room.buyer_id === user.id
    const otherUser = isBuyer ? room.seller : room.buyer
    const msgs = msgsByRoom.get(room.id) ?? []
    const lastMsg = msgs[msgs.length - 1] ?? null
    const unreadCount = msgs.filter((m: any) => !m.read_at && m.sender_id !== user.id).length

    return {
      id: room.id,
      product_id: room.product_id,
      buyer_id: room.buyer_id,
      seller_id: room.seller_id,
      product: room.product,
      other_user: otherUser,
      last_message: lastMsg ? { content: lastMsg.content, created_at: lastMsg.created_at } : null,
      unread_count: unreadCount,
    }
  })
}
