import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ItemDetail from './ItemDetail'
import { toggleFavorite, clearFavorites, getFavorites } from '../utils/storage'

beforeEach(() => {
  localStorage.clear()
  vi.clearAllMocks()
})

describe('详情页收藏', () => {
  it('未收藏时显示空心 ☆ 按钮', () => {
    render(<ItemDetail itemId="r001" onBack={() => {}} />)
    const favBtn = screen.getByTitle('收藏')
    expect(favBtn).toHaveTextContent('☆')
    expect(favBtn).not.toHaveClass('fav-btn-active')
    expect(screen.getByText('旧报纸')).toBeInTheDocument()
  })

  it('已收藏时显示实心 ★ 按钮并高亮', () => {
    toggleFavorite('r001')
    render(<ItemDetail itemId="r001" onBack={() => {}} />)
    const favBtn = screen.getByTitle('取消收藏')
    expect(favBtn).toHaveTextContent('★')
    expect(favBtn).toHaveClass('fav-btn-active')
  })

  it('点击收藏按钮：未收藏 -> 已收藏，持久化 + 触发回调', () => {
    const onFavChange = vi.fn()
    render(<ItemDetail itemId="r001" onBack={() => {}} onFavoriteChange={onFavChange} />)
    const favBtn = screen.getByTitle('收藏')

    fireEvent.click(favBtn)

    expect(favBtn).toHaveTextContent('★')
    expect(favBtn).toHaveClass('fav-btn-active')
    expect(favBtn).toHaveAttribute('title', '取消收藏')
    expect(getFavorites()).toEqual(['r001'])
    expect(JSON.parse(localStorage.getItem('waste_favorites')!)).toEqual(['r001'])
    expect(onFavChange).toHaveBeenCalledTimes(1)
  })

  it('点击收藏按钮：已收藏 -> 取消收藏，持久化 + 触发回调', () => {
    toggleFavorite('r001')
    const onFavChange = vi.fn()
    render(<ItemDetail itemId="r001" onBack={() => {}} onFavoriteChange={onFavChange} />)
    const favBtn = screen.getByTitle('取消收藏')

    fireEvent.click(favBtn)

    expect(favBtn).toHaveTextContent('☆')
    expect(favBtn).not.toHaveClass('fav-btn-active')
    expect(favBtn).toHaveAttribute('title', '收藏')
    expect(getFavorites()).toEqual([])
    expect(localStorage.getItem('waste_favorites')).toBe('[]')
    expect(onFavChange).toHaveBeenCalledTimes(1)
  })

  it('连续点击收藏/取消，状态正确切换', () => {
    const onFavChange = vi.fn()
    render(<ItemDetail itemId="r001" onBack={() => {}} onFavoriteChange={onFavChange} />)
    const favBtn = screen.getByTitle('收藏') as HTMLButtonElement

    fireEvent.click(favBtn)
    expect(getFavorites()).toEqual(['r001'])

    fireEvent.click(favBtn)
    expect(getFavorites()).toEqual([])

    fireEvent.click(favBtn)
    expect(getFavorites()).toEqual(['r001'])

    expect(onFavChange).toHaveBeenCalledTimes(3)
  })

  it('不同物品的收藏状态独立', () => {
    toggleFavorite('h001')
    const { rerender } = render(<ItemDetail itemId="r001" onBack={() => {}} />)
    expect(screen.getByTitle('收藏')).toBeInTheDocument()

    rerender(<ItemDetail itemId="h001" onBack={() => {}} />)
    expect(screen.getByTitle('取消收藏')).toBeInTheDocument()
  })

  it('不存在的 item 显示空状态，不出现收藏按钮', () => {
    render(<ItemDetail itemId="not-exist" onBack={() => {}} />)
    expect(screen.getByText('未找到该物品信息')).toBeInTheDocument()
    expect(screen.queryByTitle('收藏')).not.toBeInTheDocument()
    expect(screen.queryByTitle('取消收藏')).not.toBeInTheDocument()
  })
})
