import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number | null) {
  if (!value) return '—'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export function formatDate(date: string | null) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function capagColor(capag: string | null) {
  if (!capag) return 'text-gray-400'
  const map: Record<string, string> = { A: 'text-emerald-400', B: 'text-blue-400', C: 'text-yellow-400', D: 'text-red-400' }
  return map[capag] || 'text-gray-400'
}

export function capagBg(capag: string | null) {
  if (!capag) return 'bg-gray-800'
  const map: Record<string, string> = { A: 'bg-emerald-900/40 border-emerald-700', B: 'bg-blue-900/40 border-blue-700', C: 'bg-yellow-900/40 border-yellow-700', D: 'bg-red-900/40 border-red-700' }
  return map[capag] || 'bg-gray-800'
}

export function scoreColor(score: number) {
  if (score >= 80) return 'text-emerald-400'
  if (score >= 60) return 'text-blue-400'
  if (score >= 40) return 'text-yellow-400'
  return 'text-red-400'
}

export function scoreBg(score: number) {
  if (score >= 80) return 'bg-emerald-500'
  if (score >= 60) return 'bg-blue-500'
  if (score >= 40) return 'bg-yellow-500'
  return 'bg-red-500'
}
