'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AVATAR_PRESETS, getAvatar } from '@/lib/avatar'
import { useRouter } from 'next/navigation'

interface Props {
  initialAvatar: string
  initialBio: string
  initialNickname: string
}

export default function ProfileEditForm({ initialAvatar, initialBio, initialNickname }: Props) {
  const [avatar, setAvatar] = useState(initialAvatar)
  const [bio, setBio] = useState(initialBio)
  const [nickname, setNickname] = useState(initialNickname)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    const supabase = createClient()
    const { error: err } = await supabase
      .from('profiles')
      .update({ avatar, bio, nickname })
      .eq('id', (await supabase.auth.getUser()).data.user!.id)
    setSaving(false)
    if (err) {
      setError('저장 중 오류가 생겼어요. 다시 시도해주세요.')
      return
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
    router.refresh()
  }

  const current = getAvatar(avatar)

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-6">
      {/* 현재 아바타 미리보기 */}
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl flex-shrink-0"
          style={{ background: current.bg }}>
          {current.emoji}
        </div>
        <div>
          <p className="font-black text-xl" style={{ color: 'var(--brown-text)' }}>{nickname || '닉네임 없음'}</p>
          <p className="text-sm" style={{ color: 'var(--brown-muted)' }}>호박마켓 이웃</p>
        </div>
      </div>

      {/* 닉네임 */}
      <div>
        <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--brown-text)' }}>
          닉네임
        </label>
        <input
          type="text"
          className="input-pumpkin"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          required
          maxLength={20}
          placeholder="동네에서 불릴 이름"
        />
      </div>

      {/* 아바타 선택 */}
      <div>
        <label className="block text-sm font-semibold mb-3" style={{ color: 'var(--brown-text)' }}>
          아바타 선택
        </label>
        <div className="grid grid-cols-6 gap-2">
          {AVATAR_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setAvatar(String(idx))}
              className="w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all hover:scale-110"
              style={{
                background: preset.bg,
                outline: avatar === String(idx) ? '3px solid var(--pumpkin)' : '3px solid transparent',
                outlineOffset: '2px',
              }}
              title={preset.label}
            >
              {preset.emoji}
            </button>
          ))}
        </div>
      </div>

      {/* 자기소개 */}
      <div>
        <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--brown-text)' }}>
          자기소개
          <span className="font-normal ml-1" style={{ color: 'var(--brown-muted)' }}>
            ({bio.length}/100)
          </span>
        </label>
        <textarea
          className="input-pumpkin resize-none"
          rows={3}
          maxLength={100}
          placeholder="이웃들에게 나를 소개해봐요 🎃"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />
      </div>

      {error && <p className="error-msg">{error}</p>}

      <button type="submit" className="btn-pumpkin py-3 text-base" disabled={saving}>
        {saving ? '저장 중...' : saved ? '✓ 저장됐어요!' : '프로필 저장'}
      </button>
    </form>
  )
}
