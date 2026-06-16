export type AvatarPreset = {
  emoji: string
  bg: string
  label: string
}

export const AVATAR_PRESETS: AvatarPreset[] = [
  { emoji: '🎃', bg: 'linear-gradient(135deg, #E8650A, #C24A00)', label: '호박' },
  { emoji: '🐱', bg: 'linear-gradient(135deg, #D4956A, #A0623A)', label: '고양이' },
  { emoji: '🐶', bg: 'linear-gradient(135deg, #C4A46B, #8B6F3E)', label: '강아지' },
  { emoji: '🌱', bg: 'linear-gradient(135deg, #5D8A3C, #3A6020)', label: '새싹' },
  { emoji: '🦊', bg: 'linear-gradient(135deg, #D45F2A, #A83D0E)', label: '여우' },
  { emoji: '🐻', bg: 'linear-gradient(135deg, #8B6F4E, #5C4230)', label: '곰' },
  { emoji: '🐼', bg: 'linear-gradient(135deg, #7A8A8A, #4E5F5F)', label: '판다' },
  { emoji: '🦉', bg: 'linear-gradient(135deg, #5A8A9F, #2E6070)', label: '부엉이' },
  { emoji: '🐸', bg: 'linear-gradient(135deg, #4A9A5A, #2A6A3A)', label: '개구리' },
  { emoji: '🌻', bg: 'linear-gradient(135deg, #D4A820, #A07800)', label: '해바라기' },
  { emoji: '🐰', bg: 'linear-gradient(135deg, #C896B4, #9A6080)', label: '토끼' },
  { emoji: '🍎', bg: 'linear-gradient(135deg, #C84040, #8A1A1A)', label: '사과' },
]

export function getAvatar(avatarIndex: string | number): AvatarPreset {
  const idx = Number(avatarIndex)
  return AVATAR_PRESETS[idx] ?? AVATAR_PRESETS[0]
}
