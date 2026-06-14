import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import Home from './Home'
import { toggleFavorite, clearFavorites, getFavorites } from '../utils/storage'
import type { PageType, CategoryType } from '../types'

const makeProps = (overrides: Partial<{
  searchText: string
  onSearchChange: (text: string) => void
  onSearch: (text: string) => void
  onCategoryClick: (type: CategoryType) => void
  onDetailClick: (id: string) => void
  onNavigate: (page: PageType) => void
  favoriteVersion: number
}> = {}) => ({
  searchText: '',
  onSearchChange: vi.fn(),
  onSearch: vi.fn(),
  onCategoryClick: vi.fn(),
  onDetailClick: vi.fn(),
  onNavigate: vi.fn(),
  favoriteVersion: 0,
  ...overrides,
})

beforeEach(() => {
  localStorage.clear()
  vi.clearAllMocks()
})

describe('首页已收藏列表回看', () => {
  it('无收藏时，不显示已收藏区域', () => {
    render(<Home {...makeProps()} />)
    expect(screen.queryByText('⭐ 已收藏')).not.toBeInTheDocument()
    expect(screen.getByText('四大分类')).toBeInTheDocument()
  })

  it('有收藏时，显示已收藏列表，并包含所有收藏的物品', () => {
    toggleFavorite('r001')
    toggleFavorite('h001')
    render(<Home {...makeProps()} />)

    expect(screen.getByText('⭐ 已收藏')).toBeInTheDocument()
    expect(screen.getByText('旧报纸')).toBeInTheDocument()
    expect(screen.getByText('废电池')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: '取消收藏' })).toHaveLength(2)
  })

  it('收藏顺序与添加顺序一致（最近收藏的排在前）', () => {
    toggleFavorite('r001')
    toggleFavorite('h001')
    toggleFavorite('k001')
    render(<Home {...makeProps()} />)

    const resultItems = Array.from(
      screen.getByText('⭐ 已收藏')
        .closest('.favorites-section')!
        .querySelectorAll('.result-item')
    )
    const names = resultItems.map(el => el.querySelector('.name')!.textContent)
    expect(names[0]).toBe('菜叶')
    expect(names[1]).toBe('废电池')
    expect(names[2]).toBe('旧报纸')
  })

  it('点击收藏条目的条目 -> 触发 onDetailClick 跳转详情', () => {
    const onDetailClick = vi.fn()
    toggleFavorite('r001')
    render(<Home {...makeProps({ onDetailClick })} />)

    const item = screen.getByText('旧报纸').closest('.result-item') as HTMLElement
    fireEvent.click(item)

    expect(onDetailClick).toHaveBeenCalledWith('r001')
  })

  it('点击 ✕ 按钮 -> 取消收藏并从列表移除，不触发跳转', () => {
    const onDetailClick = vi.fn()
    toggleFavorite('r001')
    toggleFavorite('h001')
    render(<Home {...makeProps({ onDetailClick })} />)

    const removeBtns = screen.getAllByRole('button', { name: '取消收藏' })
    expect(removeBtns).toHaveLength(2)

    fireEvent.click(removeBtns[0])

    expect(getFavorites()).toEqual(['r001'])
    expect(screen.queryByText('废电池')).not.toBeInTheDocument()
    expect(screen.getByText('旧报纸')).toBeInTheDocument()
    expect(onDetailClick).not.toHaveBeenCalled()
  })

  it('favoriteVersion 变化 -> 列表刷新，模拟详情页收藏后返回首页', () => {
    const { rerender } = render(<Home {...makeProps()} />)
    expect(screen.queryByText('⭐ 已收藏')).not.toBeInTheDocument()

    act(() => {
      toggleFavorite('r001')
    })

    rerender(<Home {...makeProps({ favoriteVersion: 1 })} />)

    expect(screen.getByText('⭐ 已收藏')).toBeInTheDocument()
    expect(screen.getByText('旧报纸')).toBeInTheDocument()
  })

  it('全部取消收藏后，"已收藏"区域消失', () => {
    toggleFavorite('r001')
    const { rerender } = render(<Home {...makeProps()} />)
    expect(screen.getByText('⭐ 已收藏')).toBeInTheDocument()

    const removeBtn = screen.getByRole('button', { name: '取消收藏' })
    fireEvent.click(removeBtn)

    expect(screen.queryByText('⭐ 已收藏')).not.toBeInTheDocument()
  })

  it('收藏条目中显示正确的分类标签', () => {
    toggleFavorite('r001')
    toggleFavorite('h001')
    render(<Home {...makeProps()} />)

    const r001Item = screen.getByText('旧报纸').closest('.result-item') as HTMLElement
    const h001Item = screen.getByText('废电池').closest('.result-item') as HTMLElement

    expect(r001Item.querySelector('.tag-recycle')).toBeInTheDocument()
    expect(r001Item).toHaveClass('recycle-border')
    expect(h001Item.querySelector('.tag-harmful')).toBeInTheDocument()
    expect(h001Item).toHaveClass('harmful-border')
  })

  it('清除所有历史不影响收藏', () => {
    toggleFavorite('r001')
    clearFavorites()
    render(<Home {...makeProps()} />)
    expect(screen.queryByText('⭐ 已收藏')).not.toBeInTheDocument()
  })
})
