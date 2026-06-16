'use client'

import { useState, useTransition, useEffect, useRef } from 'react'
import Link from 'next/link'
import { addComment, updateComment, deleteComment } from '@/app/actions/comments'

interface Comment {
  id: string
  content: string
  created_at: string
  updated_at: string
  user_id: string
  author: { nickname: string } | null
}

interface CommentSectionProps {
  productId: string
  initialComments: Comment[]
  currentUserId: string | null
  isOwner: boolean
}

export default function CommentSection({
  productId,
  initialComments,
  currentUserId,
  isOwner,
}: CommentSectionProps) {
  const [comments, setComments] = useState(initialComments)
  const [newContent, setNewContent] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setComments(initialComments)
  }, [initialComments])

  const canWrite = !!currentUserId && !isOwner

  const handleAdd = () => {
    if (!newContent.trim() || isPending) return
    setError(null)
    startTransition(async () => {
      const result = await addComment(productId, newContent)
      if (result?.error) {
        setError(result.error)
      } else {
        setNewContent('')
      }
    })
  }

  const handleUpdate = (commentId: string) => {
    if (!editContent.trim() || isPending) return
    setError(null)
    startTransition(async () => {
      const result = await updateComment(commentId, editContent, productId)
      if (result?.error) {
        setError(result.error)
      } else {
        setEditingId(null)
        setEditContent('')
      }
    })
  }

  const handleDelete = (commentId: string) => {
    if (!confirm('댓글을 삭제할까요?')) return
    startTransition(async () => {
      await deleteComment(commentId, productId)
    })
  }

  const startEdit = (comment: Comment) => {
    setEditingId(comment.id)
    setEditContent(comment.content)
    setError(null)
  }

  return (
    <div className="card-pumpkin p-6 mt-4">
      <h2 className="font-black text-base mb-5" style={{ color: 'var(--pumpkin-dark)' }}>
        💬 댓글 {comments.length}개
      </h2>

      {comments.length === 0 ? (
        <p className="text-sm text-center py-4" style={{ color: 'var(--brown-muted)' }}>
          아직 댓글이 없어요. 첫 댓글을 남겨보세요!
        </p>
      ) : (
        <div className="flex flex-col gap-3 mb-5">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="p-3.5 rounded-2xl"
              style={{ background: 'var(--pumpkin-pale)', border: '1px solid var(--pumpkin-border)' }}
            >
              {/* 작성자 헤더 */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, var(--pumpkin), var(--pumpkin-dark))' }}
                  >
                    {(comment.author?.nickname ?? '?')[0]}
                  </div>
                  <div>
                    <span className="text-sm font-bold" style={{ color: 'var(--pumpkin-dark)' }}>
                      {comment.author?.nickname ?? '알 수 없음'}
                    </span>
                    <span className="text-xs ml-2" style={{ color: 'var(--brown-muted)' }}>
                      {new Date(comment.created_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                      {comment.updated_at !== comment.created_at && ' · 수정됨'}
                    </span>
                  </div>
                </div>

                {currentUserId === comment.user_id && editingId !== comment.id && (
                  <div className="flex gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => startEdit(comment)}
                      className="text-xs px-2 py-0.5 rounded-lg font-semibold transition-colors"
                      style={{ color: 'var(--pumpkin)', background: 'white', border: '1px solid var(--pumpkin-border)' }}
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDelete(comment.id)}
                      disabled={isPending}
                      className="text-xs px-2 py-0.5 rounded-lg font-semibold transition-colors"
                      style={{ color: '#CC2200', background: '#FFF0F0', border: '1px solid #FFCCCC' }}
                    >
                      삭제
                    </button>
                  </div>
                )}
              </div>

              {/* 댓글 내용 or 수정 폼 */}
              {editingId === comment.id ? (
                <div className="flex flex-col gap-2 mt-2">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={2}
                    maxLength={500}
                    className="input-pumpkin text-sm resize-none"
                  />
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => { setEditingId(null); setEditContent('') }}
                      className="text-xs px-3 py-1.5 rounded-xl font-semibold"
                      style={{ color: 'var(--brown-muted)', background: 'white', border: '1.5px solid var(--pumpkin-border)' }}
                    >
                      취소
                    </button>
                    <button
                      onClick={() => handleUpdate(comment.id)}
                      disabled={isPending || !editContent.trim()}
                      className="text-xs px-3 py-1.5 rounded-xl font-semibold text-white"
                      style={{ background: 'var(--pumpkin)', border: 'none' }}
                    >
                      {isPending ? '저장 중...' : '저장'}
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm leading-relaxed whitespace-pre-wrap pl-9" style={{ color: 'var(--brown-text)' }}>
                  {comment.content}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 입력 영역 */}
      {canWrite ? (
        <div
          className={comments.length > 0 ? 'border-t pt-5' : ''}
          style={comments.length > 0 ? { borderColor: 'var(--pumpkin-border)' } : {}}
        >
          {error && <p className="error-msg mb-3">{error}</p>}
          <div className="flex gap-2 items-end">
            <textarea
              ref={textareaRef}
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="따뜻한 댓글을 남겨보세요 (최대 500자)"
              rows={2}
              maxLength={500}
              className="input-pumpkin text-sm resize-none flex-1"
              onKeyDown={(e) => { if (e.key === 'Enter' && e.ctrlKey) handleAdd() }}
            />
            <button
              onClick={handleAdd}
              disabled={isPending || !newContent.trim()}
              className="btn-pumpkin text-sm px-4 py-3"
              style={{ width: 'auto' }}
            >
              {isPending ? '...' : '등록'}
            </button>
          </div>
          <p className="text-xs mt-1.5" style={{ color: 'var(--brown-muted)' }}>
            Ctrl + Enter로도 등록할 수 있어요
          </p>
        </div>
      ) : currentUserId && isOwner ? (
        <p
          className="text-xs text-center pt-4 border-t"
          style={{ borderColor: 'var(--pumpkin-border)', color: 'var(--brown-muted)' }}
        >
          내가 올린 상품에는 댓글을 달 수 없어요
        </p>
      ) : (
        <div className="border-t pt-4 text-center" style={{ borderColor: 'var(--pumpkin-border)' }}>
          <Link href="/auth/login" className="text-sm font-bold no-underline" style={{ color: 'var(--pumpkin)' }}>
            로그인하고 댓글 달기 →
          </Link>
        </div>
      )}
    </div>
  )
}
