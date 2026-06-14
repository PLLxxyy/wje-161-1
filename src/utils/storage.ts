import { SearchHistoryItem } from '../types'

const HISTORY_KEY = 'waste_search_history'
const THEME_KEY = 'waste_theme'
const MAX_HISTORY = 20

export const getHistory = (): SearchHistoryItem[] => {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    if (!raw) return []
    return JSON.parse(raw) as SearchHistoryItem[]
  } catch {
    return []
  }
}

export const addHistory = (keyword: string): SearchHistoryItem[] => {
  const trimmed = keyword.trim()
  if (!trimmed) return getHistory()
  const history = getHistory().filter(h => h.keyword !== trimmed)
  history.unshift({ keyword: trimmed, timestamp: Date.now() })
  const trimmedHistory = history.slice(0, MAX_HISTORY)
  localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmedHistory))
  return trimmedHistory
}

export const clearHistory = (): void => {
  localStorage.removeItem(HISTORY_KEY)
}

export const getTheme = (): 'light' | 'dark' => {
  const t = localStorage.getItem(THEME_KEY)
  if (t === 'dark' || t === 'light') return t
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const FAVORITES_KEY = 'waste_favorites'

export const getFavorites = (): string[] => {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY)
    if (!raw) return []
    return JSON.parse(raw) as string[]
  } catch {
    return []
  }
}

export const isFavorite = (id: string): boolean => {
  return getFavorites().includes(id)
}

export const toggleFavorite = (id: string): string[] => {
  const favorites = getFavorites()
  const index = favorites.indexOf(id)
  if (index >= 0) {
    favorites.splice(index, 1)
  } else {
    favorites.unshift(id)
  }
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites))
  return favorites
}

export const removeFavorite = (id: string): string[] => {
  const favorites = getFavorites().filter(f => f !== id)
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites))
  return favorites
}

export const clearFavorites = (): void => {
  localStorage.removeItem(FAVORITES_KEY)
}

export const setTheme = (theme: 'light' | 'dark'): void => {
  localStorage.setItem(THEME_KEY, theme)
  document.documentElement.setAttribute('data-theme', theme)
}
