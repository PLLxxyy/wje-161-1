import React from 'react'
import { PageType, CategoryType, SearchHistoryItem } from '../types'
import { categories } from '../data/items'
import { getItemById } from '../data/items'
import { getHistory, clearHistory, getFavorites, removeFavorite } from '../utils/storage'
import { searchItems, highlightText } from '../utils/search'

interface Props {
  searchText: string
  onSearchChange: (text: string) => void
  onSearch: (text: string) => void
  onCategoryClick: (type: CategoryType) => void
  onDetailClick: (id: string) => void
  onNavigate: (page: PageType) => void
  favoriteVersion?: number
}

const Home: React.FC<Props> = ({
  searchText,
  onSearchChange,
  onSearch,
  onCategoryClick,
  onDetailClick,
  onNavigate,
  favoriteVersion,
}) => {
  const [history, setHistory] = React.useState<SearchHistoryItem[]>(getHistory())
  const [showDropdown, setShowDropdown] = React.useState(false)
  const [favoriteIds, setFavoriteIds] = React.useState<string[]>(getFavorites())

  const results = React.useMemo(() => searchItems(searchText), [searchText])
  const showResults = searchText.trim().length > 0

  const handleSearch = (text: string) => {
    if (text.trim()) {
      onSearch(text.trim())
      setHistory(getHistory())
    }
  }

  const handleClearHistory = () => {
    clearHistory()
    setHistory([])
  }

  React.useEffect(() => {
    setFavoriteIds(getFavorites())
  }, [favoriteVersion])

  const handleRemoveFavorite = (id: string) => {
    removeFavorite(id)
    setFavoriteIds(getFavorites())
  }

  const favoriteItems = React.useMemo(() => {
    return favoriteIds.map(id => getItemById(id)).filter(Boolean)
  }, [favoriteIds])

  return (
    <div className="container fade-in">
      <div className="search-box">
        <span className="search-icon">🔍</span>
        <input
          className="search-input"
          type="text"
          placeholder="搜索垃圾物品，如「旧报纸」「电池」「西瓜皮」"
          value={searchText}
          onChange={e => { onSearchChange(e.target.value); setShowDropdown(true) }}
          onFocus={() => setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
          onKeyDown={e => { if (e.key === 'Enter') handleSearch(searchText) }}
        />
        {searchText && (
          <button className="search-clear" onClick={() => onSearchChange('')}>✕</button>
        )}
      </div>

      {showResults && showDropdown && (
        <div className="result-list fade-in" style={{ maxHeight: 400, overflowY: 'auto' }}>
          {results.length === 0 ? (
            <div className="empty-state">
              <div className="icon">😕</div>
              <p>没有找到「{searchText}」相关物品</p>
            </div>
          ) : (
            results.slice(0, 20).map(r => (
              <div
                key={r.item.id}
                className={`result-item ${r.item.category === 'recycle' ? 'recycle-border' : r.item.category === 'harmful' ? 'harmful-border' : r.item.category === 'kitchen' ? 'kitchen-border' : 'other-border'}`}
                onClick={() => { handleSearch(searchText); onDetailClick(r.item.id) }}
              >
                <div className="info">
                  <div
                    className="name"
                    dangerouslySetInnerHTML={{ __html: highlightText(r.item.name, searchText) }}
                  />
                  <div className="tip">{r.item.description.slice(0, 40)}...</div>
                </div>
                <span className={`tag tag-${r.item.category}`}>
                  {categories.find(c => c.type === r.item.category)?.name}
                </span>
              </div>
            ))
          )}
        </div>
      )}

      {favoriteItems.length > 0 && (
        <div className="favorites-section fade-in">
          <div className="favorites-header">
            <h2 style={{ fontSize: 17, fontWeight: 700 }}>⭐ 已收藏</h2>
          </div>
          <div className="favorites-list">
            {favoriteItems.map(item => {
              const cat = categories.find(c => c.type === item!.category)
              return (
                <div
                  key={item!.id}
                  className={`result-item ${item!.category === 'recycle' ? 'recycle-border' : item!.category === 'harmful' ? 'harmful-border' : item!.category === 'kitchen' ? 'kitchen-border' : 'other-border'}`}
                  onClick={() => onDetailClick(item!.id)}
                >
                  <div className="info">
                    <div className="name">{item!.name}</div>
                    <div className="tip">{item!.description.slice(0, 40)}...</div>
                  </div>
                  <span className={`tag tag-${item!.category}`}>
                    {cat?.name}
                  </span>
                  <button
                    className="fav-remove-btn"
                    onClick={e => { e.stopPropagation(); handleRemoveFavorite(item!.id) }}
                    title="取消收藏"
                    aria-label={`取消收藏${item!.name}`}
                  >
                    ✕
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <h2 style={{ fontSize: 17, fontWeight: 700, margin: '24px 0 12px' }}>四大分类</h2>
      <div className="category-grid">
        {categories.map(cat => (
          <div
            key={cat.type}
            className={`category-card ${cat.bgClass}`}
            onClick={() => onCategoryClick(cat.type)}
          >
            <div className="emoji">{cat.emoji}</div>
            <div className="name">{cat.name}</div>
            <div className="desc">{cat.description.slice(0, 18)}...</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 12, margin: '16px 0' }}>
        <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => onNavigate('photo')}>
          📷 拍照识物
        </button>
        <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => onNavigate('guide')}>
          📖 分类指南
        </button>
      </div>

      {history.length > 0 && (
        <div className="history-section">
          <div className="history-header">
            <h3>🕐 搜索历史</h3>
            <button className="history-clear-btn" onClick={handleClearHistory}>清空</button>
          </div>
          <div className="history-tags">
            {history.map((h, i) => (
              <span
                key={i}
                className="history-tag"
                onClick={() => { onSearchChange(h.keyword); handleSearch(h.keyword) }}
              >
                {h.keyword}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Home
