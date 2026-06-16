'use client'

import { useState } from 'react'

interface ImageGalleryProps {
  images: string[]
  title: string
}

export default function ImageGallery({ images, title }: ImageGalleryProps) {
  const [current, setCurrent] = useState(0)
  const [lightbox, setLightbox] = useState(false)

  if (images.length === 0) return null

  const prev = () => setCurrent((c) => (c - 1 + images.length) % images.length)
  const next = () => setCurrent((c) => (c + 1) % images.length)

  return (
    <>
      {/* 메인 이미지 */}
      <div className="relative w-full bg-black" style={{ aspectRatio: '4/3', maxHeight: '420px' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[current]}
          alt={`${title} 이미지 ${current + 1}`}
          className="w-full h-full object-contain cursor-zoom-in"
          onClick={() => setLightbox(true)}
        />

        {/* 이전/다음 버튼 */}
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center text-white font-bold cursor-pointer transition-all"
              style={{ background: 'rgba(0,0,0,0.45)' }}
              aria-label="이전 이미지"
            >
              ‹
            </button>
            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center text-white font-bold cursor-pointer transition-all"
              style={{ background: 'rgba(0,0,0,0.45)' }}
              aria-label="다음 이미지"
            >
              ›
            </button>
          </>
        )}

        {/* 페이지 표시 */}
        {images.length > 1 && (
          <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full text-xs text-white font-bold"
            style={{ background: 'rgba(0,0,0,0.5)' }}>
            {current + 1} / {images.length}
          </div>
        )}
      </div>

      {/* 썸네일 목록 */}
      {images.length > 1 && (
        <div className="flex gap-2 px-4 py-3 overflow-x-auto" style={{ background: '#1a1a1a' }}>
          {images.map((url, i) => (
            <button
              key={url}
              onClick={() => setCurrent(i)}
              className="flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden transition-all cursor-pointer"
              style={{
                border: i === current ? '2px solid var(--pumpkin)' : '2px solid transparent',
                opacity: i === current ? 1 : 0.55,
              }}
              aria-label={`이미지 ${i + 1} 선택`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* 라이트박스 (전체화면) */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.92)' }}
          onClick={() => setLightbox(false)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[current]}
            alt={`${title} 이미지 ${current + 1}`}
            className="max-w-full max-h-full object-contain"
            style={{ maxHeight: '90vh', maxWidth: '90vw' }}
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={() => setLightbox(false)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center text-white text-xl font-bold cursor-pointer"
            style={{ background: 'rgba(255,255,255,0.15)' }}
            aria-label="닫기"
          >
            ×
          </button>
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev() }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center text-white text-2xl font-bold cursor-pointer"
                style={{ background: 'rgba(255,255,255,0.15)' }}
                aria-label="이전"
              >
                ‹
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next() }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center text-white text-2xl font-bold cursor-pointer"
                style={{ background: 'rgba(255,255,255,0.15)' }}
                aria-label="다음"
              >
                ›
              </button>
            </>
          )}
        </div>
      )}
    </>
  )
}
