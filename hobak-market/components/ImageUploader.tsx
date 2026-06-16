'use client'

import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface ImageUploaderProps {
  images: string[]           // 현재 이미지 URL 목록
  onChange: (urls: string[]) => void  // 이미지 목록이 바뀔 때 호출
  maxImages?: number
}

export default function ImageUploader({ images, onChange, maxImages = 10 }: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setError('')

    const remaining = maxImages - images.length
    if (remaining <= 0) {
      setError(`이미지는 최대 ${maxImages}장까지 올릴 수 있어요.`)
      return
    }

    const filesToUpload = Array.from(files).slice(0, remaining)
    setUploading(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('로그인이 필요해요.')
      setUploading(false)
      return
    }

    const uploaded: string[] = []
    for (const file of filesToUpload) {
      if (file.size > 10 * 1024 * 1024) {
        setError('파일 하나당 최대 10MB까지 업로드할 수 있어요.')
        continue
      }
      const ext = file.name.split('.').pop()
      const path = `${user.id}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(path, file, { upsert: false })

      if (uploadError) {
        setError('이미지 업로드 중 오류가 발생했어요.')
        continue
      }

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(path)

      uploaded.push(publicUrl)
    }

    onChange([...images, ...uploaded])
    setUploading(false)
  }

  const handleDelete = async (url: string, index: number) => {
    const supabase = createClient()
    // URL에서 파일 경로 추출
    const pathMatch = url.match(/product-images\/(.+)$/)
    if (pathMatch) {
      await supabase.storage.from('product-images').remove([pathMatch[1]])
    }
    const next = images.filter((_, i) => i !== index)
    onChange(next)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    handleFiles(e.dataTransfer.files)
  }

  return (
    <div className="flex flex-col gap-3">
      {/* 미리보기 그리드 */}
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {images.map((url, i) => (
            <div key={url} className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0"
              style={{ border: '2px solid var(--pumpkin-border)' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`상품 이미지 ${i + 1}`}
                className="w-full h-full object-cover" />
              {i === 0 && (
                <span className="absolute top-1 left-1 text-[10px] font-bold text-white px-1.5 py-0.5 rounded-full"
                  style={{ background: 'var(--pumpkin)' }}>
                  대표
                </span>
              )}
              <button
                type="button"
                onClick={() => handleDelete(url, i)}
                className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-black cursor-pointer"
                style={{ background: 'rgba(0,0,0,0.55)' }}
                aria-label="이미지 삭제"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 업로드 버튼 영역 */}
      {images.length < maxImages && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center justify-center gap-2 rounded-xl cursor-pointer transition-all py-8"
          style={{
            border: '2px dashed var(--pumpkin-border)',
            background: uploading ? 'var(--pumpkin-pale)' : '#fff',
          }}
        >
          <span className="text-3xl">{uploading ? '⏳' : '📷'}</span>
          <p className="text-sm font-semibold" style={{ color: 'var(--brown-muted)' }}>
            {uploading
              ? '업로드 중...'
              : `사진 추가하기 (${images.length}/${maxImages})`}
          </p>
          <p className="text-xs" style={{ color: 'var(--brown-muted)' }}>
            클릭하거나 드래그해서 올려주세요 · 최대 10MB
          </p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {error && (
        <p className="text-xs font-semibold" style={{ color: '#E53E3E' }}>{error}</p>
      )}
    </div>
  )
}
