import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Plus, X, Sparkles } from 'lucide-react'
import { AnimatePresence as AP } from 'framer-motion'
import IngredientTag from './IngredientTag.jsx'

const COMMON_INGREDIENTS = [
  'Eggs', 'Garlic', 'Tomato', 'Onion', 'Carrot', 'Chicken', 'Cheese', 'Rice',
  'Broccoli', 'Beef', 'Lemon', 'Butter', 'Pasta', 'Potato', 'Spinach', 'Mushroom',
  'Bell Pepper', 'Milk', 'Flour', 'Olive Oil', 'Basil', 'Ginger', 'Shrimp',
  'Avocado', 'Corn', 'Soy Sauce', 'Cream', 'Yogurt', 'Bread', 'Fish', 'Honey',
]

const QUICK_ADD = [
  { name: 'Eggs', emoji: '🥚' },
  { name: 'Garlic', emoji: '🧄' },
  { name: 'Tomato', emoji: '🍅' },
  { name: 'Onion', emoji: '🧅' },
  { name: 'Carrot', emoji: '🥕' },
  { name: 'Chicken', emoji: '🐔' },
  { name: 'Cheese', emoji: '🧀' },
  { name: 'Rice', emoji: '🫙' },
  { name: 'Broccoli', emoji: '🥦' },
  { name: 'Beef', emoji: '🥩' },
  { name: 'Lemon', emoji: '🍋' },
  { name: 'Butter', emoji: '🧈' },
]

export default function IngredientInput({ ingredients, onAdd, onRemove, onClear }) {
  const [inputValue, setInputValue] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleInputChange = (e) => {
    const val = e.target.value
    setInputValue(val)

    if (val.trim().length > 0) {
      const filtered = COMMON_INGREDIENTS.filter(
        i => i.toLowerCase().includes(val.toLowerCase()) &&
          !ingredients.map(x => x.toLowerCase()).includes(i.toLowerCase())
      ).slice(0, 6)
      setSuggestions(filtered)
      setShowSuggestions(filtered.length > 0)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  const addIngredient = (name) => {
    const cleaned = name.trim()
    if (!cleaned) return
    if (ingredients.map(i => i.toLowerCase()).includes(cleaned.toLowerCase())) return
    onAdd(cleaned)
    setInputValue('')
    setSuggestions([])
    setShowSuggestions(false)
    inputRef.current?.focus()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      // Handle comma-separated
      const parts = inputValue.split(',').map(p => p.trim()).filter(Boolean)
      parts.forEach(p => addIngredient(p))
      return
    }
    if (e.key === ',') {
      e.preventDefault()
      if (inputValue.trim()) addIngredient(inputValue.split(',')[0])
    }
    if (e.key === 'Backspace' && !inputValue && ingredients.length > 0) {
      onRemove(ingredients[ingredients.length - 1])
    }
    if (e.key === 'Escape') {
      setShowSuggestions(false)
    }
  }

  const handlePaste = (e) => {
    const text = e.clipboardData.getData('text')
    if (text.includes(',')) {
      e.preventDefault()
      const parts = text.split(',').map(p => p.trim()).filter(Boolean)
      parts.forEach(p => addIngredient(p))
    }
  }

  return (
    <div className="space-y-4">
      {/* Input area */}
      <div ref={containerRef} className="relative">
        <div
          className="min-h-[56px] flex flex-wrap items-center gap-2 p-3 bg-white rounded-2xl border-2 border-border focus-within:border-primary/40 focus-within:shadow-[0_0_0_4px_rgba(255,107,53,0.08)] transition-all cursor-text"
          onClick={() => inputRef.current?.focus()}
        >
          <Search size={18} className="text-textmuted shrink-0 ml-1" />

          <AnimatePresence mode="popLayout">
            {ingredients.map((ing, i) => (
              <IngredientTag key={ing} ingredient={ing} onRemove={onRemove} index={i} />
            ))}
          </AnimatePresence>

          <input
            ref={inputRef}
            id="ingredient-search-input"
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            onFocus={() => inputValue && setShowSuggestions(suggestions.length > 0)}
            placeholder={ingredients.length === 0 ? 'Type an ingredient and press Enter... or paste a comma-separated list' : 'Add more ingredients...'}
            className="flex-1 min-w-[160px] border-none outline-none bg-transparent text-textdark placeholder:text-textmuted/60 text-sm py-1"
          />

          {inputValue && (
            <button onClick={() => { setInputValue(''); setSuggestions([]); setShowSuggestions(false); inputRef.current?.focus() }}
              className="p-1 hover:bg-surface-100 rounded-lg text-textmuted transition-all">
              <X size={14} />
            </button>
          )}

          {ingredients.length > 0 && (
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-xs font-mono text-textmuted bg-surface-100 px-2 py-1 rounded-lg border border-border">
                {ingredients.length} item{ingredients.length !== 1 ? 's' : ''}
              </span>
              <button onClick={onClear}
                className="text-xs text-textmuted hover:text-primary font-medium transition-colors">
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Autocomplete dropdown */}
        <AnimatePresence>
          {showSuggestions && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-border shadow-lg z-20 overflow-hidden"
            >
              {suggestions.map((s, i) => (
                <button
                  key={s}
                  onClick={() => addIngredient(s)}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-surface-100 text-textdark flex items-center gap-2 transition-colors border-b border-border/50 last:border-0"
                >
                  <Plus size={12} className="text-primary shrink-0" />
                  <span className="font-medium">{s}</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Quick-add chips */}
      {ingredients.length < 8 && (
        <div>
          <p className="text-xs font-semibold text-textmuted uppercase tracking-wider mb-2">
            Common ingredients — tap to add
          </p>
          <div className="flex flex-wrap gap-2">
            {QUICK_ADD.filter(q => !ingredients.map(i => i.toLowerCase()).includes(q.name.toLowerCase())).map((q) => (
              <motion.button
                key={q.name}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => addIngredient(q.name)}
                id={`quick-add-${q.name.toLowerCase()}`}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-border rounded-full text-sm text-textdark hover:border-primary/30 hover:bg-primary-50 hover:text-primary transition-all font-medium"
              >
                <span>{q.emoji}</span>
                <span>{q.name}</span>
                <Plus size={11} className="text-textmuted" />
              </motion.button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
