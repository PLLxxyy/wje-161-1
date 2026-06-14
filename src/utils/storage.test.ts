import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  getFavorites,
  isFavorite,
  toggleFavorite,
  removeFavorite,
  clearFavorites,
  getHistory,
  addHistory,
  clearHistory,
} from './storage'

const FAV_KEY = 'waste_favorites'
const HIST_KEY = 'waste_search_history'

beforeEach(() => {
  localStorage.clear()
  vi.clearAllMocks()
})

describe('收藏持久化（刷新后正常）', () => {
  it('初始收藏列表为空', () => {
    expect(getFavorites()).toEqual([])
    expect(isFavorite('r001')).toBe(false)
  })

  it('toggleFavorite 能将新物品加入收藏并写入 localStorage', () => {
    const result = toggleFavorite('r001')
    expect(result).toEqual(['r001'])
    expect(getFavorites()).toEqual(['r001'])
    expect(isFavorite('r001')).toBe(true)
    expect(JSON.parse(localStorage.getItem(FAV_KEY)!)).toEqual(['r001'])
  })

  it('toggleFavorite 对已收藏物品能取消收藏并同步 localStorage', () => {
    toggleFavorite('r001')
    toggleFavorite('h002')
    expect(getFavorites()).toEqual(['h002', 'r001'])

    const result = toggleFavorite('r001')
    expect(result).toEqual(['h002'])
    expect(isFavorite('r001')).toBe(false)
    expect(JSON.parse(localStorage.getItem(FAV_KEY)!)).toEqual(['h002'])
  })

  it('模拟页面刷新：重新读取 localStorage 数据一致', () => {
    toggleFavorite('r001')
    toggleFavorite('k003')

    const raw = localStorage.getItem(FAV_KEY)
    localStorage.clear()
    expect(getFavorites()).toEqual([])

    localStorage.setItem(FAV_KEY, raw!)
    expect(getFavorites()).toEqual(['k003', 'r001'])
    expect(isFavorite('r001')).toBe(true)
    expect(isFavorite('k003')).toBe(true)
    expect(isFavorite('h002')).toBe(false)
  })

  it('removeFavorite 能移除指定收藏', () => {
    toggleFavorite('r001')
    toggleFavorite('h002')
    const result = removeFavorite('r001')
    expect(result).toEqual(['h002'])
    expect(isFavorite('r001')).toBe(false)
    expect(isFavorite('h002')).toBe(true)
    expect(JSON.parse(localStorage.getItem(FAV_KEY)!)).toEqual(['h002'])
  })

  it('clearFavorites 能清空所有收藏', () => {
    toggleFavorite('r001')
    toggleFavorite('h002')
    clearFavorites()
    expect(getFavorites()).toEqual([])
    expect(localStorage.getItem(FAV_KEY)).toBeNull()
  })

  it('收藏和历史记录互不干扰', () => {
    toggleFavorite('r001')
    addHistory('电池')
    expect(JSON.parse(localStorage.getItem(FAV_KEY)!)).toEqual(['r001'])
    expect(JSON.parse(localStorage.getItem(HIST_KEY)!).map((h: any) => h.keyword)).toEqual(['电池'])
    clearFavorites()
    expect(getHistory().map(h => h.keyword)).toEqual(['电池'])
    clearHistory()
    expect(getFavorites()).toEqual([])
  })

  it('localStorage 损坏时 getFavorites 返回空数组', () => {
    localStorage.setItem(FAV_KEY, 'not-valid-json{{{')
    expect(getFavorites()).toEqual([])
    expect(isFavorite('r001')).toBe(false)
  })
})
