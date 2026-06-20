import { motion } from 'framer-motion'
import { Clock, Users, ChefHat, Heart, ArrowRight, Zap } from 'lucide-react'

function MatchScoreBadge({ score }) {
  const color = score >= 80 ? '#2D9C6B' : score >= 60 ? '#F7C948' : '#FF6B35'
  const bgColor = score >= 80 ? '#EDFAF3' : score >= 60 ? '#FFFBEC' : '#FFF3EE'

  return (
    <div
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
      style={{ background: bgColor, color }}
    >
      {score}% matched
    </div>
  )
}

function DifficultyBadge({ difficulty }) {
  const classes = {
    Easy: 'badge-easy',
    Medium: 'badge-medium',
    Hard: 'badge-hard',
  }
  return <span className={classes[difficulty] || 'badge-easy'}>{difficulty}</span>
}

export default function SuggestionCard({ suggestion, onView, onSave, isSaved, index }) {
  const { name, cuisine, cuisineEmoji, description, prepTime, cookTime, totalTime, difficulty,
    estimatedCalories, matchScore, ingredientsUsed, extraIngredients } = suggestion

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.12, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="card overflow-hidden group hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300"
    >
      {/* Colored top strip */}
      <div className="h-1.5 w-full bg-gradient-to-r from-primary to-accent" />

      <div className="p-5 sm:p-6">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">{cuisineEmoji}</span>
              <span className="text-xs text-textmuted font-medium">{cuisine}</span>
            </div>
            <h3 className="font-display text-xl sm:text-2xl font-bold text-textdark leading-tight">
              {name}
            </h3>
          </div>
          <MatchScoreBadge score={matchScore} />
        </div>

        <p className="text-textmuted text-sm leading-relaxed mb-4 line-clamp-2">{description}</p>

        {/* Stats row */}
        <div className="flex flex-wrap items-center gap-3 mb-4 pb-4 border-b border-border">
          <div className="flex items-center gap-1.5 text-xs text-textmuted">
            <Clock size={13} className="text-primary" />
            <span><span className="font-semibold text-textdark">{prepTime}</span> prep</span>
          </div>
          <div className="text-border">·</div>
          <div className="flex items-center gap-1.5 text-xs text-textmuted">
            <ChefHat size={13} className="text-primary" />
            <span><span className="font-semibold text-textdark">{cookTime}</span> cook</span>
          </div>
          <div className="text-border">·</div>
          <div className="flex items-center gap-1.5 text-xs text-textmuted">
            <span>🔥</span>
            <span className="font-semibold text-textdark">{estimatedCalories}</span>
          </div>
          <div className="ml-auto">
            <DifficultyBadge difficulty={difficulty} />
          </div>
        </div>

        {/* Ingredients */}
        <div className="mb-5 space-y-2">
          {ingredientsUsed.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-secondary uppercase tracking-wider mb-1.5">✓ You already have</p>
              <div className="flex flex-wrap gap-1.5">
                {ingredientsUsed.map(ing => (
                  <span key={ing} className="px-2 py-0.5 bg-secondary-50 text-secondary-700 border border-secondary-100 rounded-full text-xs font-medium capitalize">
                    {ing}
                  </span>
                ))}
              </div>
            </div>
          )}
          {extraIngredients.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-textmuted uppercase tracking-wider mb-1.5">+ You'll need to buy</p>
              <div className="flex flex-wrap gap-1.5">
                {extraIngredients.map(ing => (
                  <span key={ing} className="px-2 py-0.5 bg-surface-100 text-textmuted border border-border rounded-full text-xs font-medium capitalize">
                    {ing}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            id={`view-recipe-${index + 1}-btn`}
            onClick={() => onView(suggestion)}
            className="btn-primary flex-1 py-2.5 text-sm"
          >
            View Full Recipe
            <ArrowRight size={14} />
          </button>
          <button
            id={`save-recipe-${index + 1}-btn`}
            onClick={() => onSave(suggestion)}
            className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${
              isSaved
                ? 'bg-primary-50 border-primary/30 text-primary'
                : 'bg-white border-border text-textmuted hover:border-primary/30 hover:text-primary hover:bg-primary-50'
            }`}
            aria-label={isSaved ? 'Saved' : 'Save recipe'}
          >
            <Heart size={16} className={isSaved ? 'fill-primary' : ''} />
          </button>
        </div>
      </div>
    </motion.div>
  )
}
