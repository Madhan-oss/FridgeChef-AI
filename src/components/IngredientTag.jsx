import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

// Common ingredient emojis
const EMOJI_MAP = {
  egg: '🥚', eggs: '🥚',
  garlic: '🧄',
  tomato: '🍅', tomatoes: '🍅',
  onion: '🧅', onions: '🧅',
  carrot: '🥕', carrots: '🥕',
  chicken: '🐔',
  cheese: '🧀',
  rice: '🫙',
  broccoli: '🥦',
  beef: '🥩',
  lemon: '🍋',
  butter: '🧈',
  potato: '🥔', potatoes: '🥔',
  milk: '🥛',
  flour: '🌾',
  pasta: '🍝',
  spinach: '🥬',
  mushroom: '🍄', mushrooms: '🍄',
  pepper: '🫑', peppers: '🫑',
  salt: '🧂',
  oil: '🫙',
  bread: '🍞',
  fish: '🐟',
  shrimp: '🍤',
  corn: '🌽',
  avocado: '🥑',
  apple: '🍎', apples: '🍎',
  banana: '🍌', bananas: '🍌',
  strawberry: '🍓', strawberries: '🍓',
  basil: '🌿',
  mint: '🌿',
  parsley: '🌿',
  ginger: '🫚',
  soy: '🫙',
  yogurt: '🥛',
  cream: '🥛',
  sugar: '🍬',
  honey: '🍯',
}

function getEmoji(ingredient) {
  const lower = ingredient.toLowerCase().trim()
  for (const [key, emoji] of Object.entries(EMOJI_MAP)) {
    if (lower.includes(key)) return emoji
  }
  return '🥘'
}

export default function IngredientTag({ ingredient, onRemove, index = 0 }) {
  return (
    <motion.span
      layout
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0, x: -10 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30, delay: index * 0.03 }}
      className="ingredient-tag group"
    >
      <span className="text-base leading-none">{getEmoji(ingredient)}</span>
      <span className="capitalize">{ingredient}</span>
      <button
        onClick={() => onRemove(ingredient)}
        className="ml-0.5 w-4 h-4 rounded-full bg-primary-100 flex items-center justify-center hover:bg-primary-200 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
        aria-label={`Remove ${ingredient}`}
      >
        <X size={10} strokeWidth={2.5} />
      </button>
    </motion.span>
  )
}
