import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import EditProductForm from './EditProductForm'

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (!product) notFound()

  // 내 글이 아니면 상세 페이지로 돌려보냄
  if (product.user_id !== user.id) redirect(`/products/${id}`)

  return <EditProductForm product={product} />
}
