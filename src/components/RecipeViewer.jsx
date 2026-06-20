import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Heart, Printer, Clock, Users, ChefHat, RotateCcw, CheckSquare, Square, Flame } from 'lucide-react'
import toast from 'react-hot-toast'

function parseRecipeSections(text) {
  const sections = {}

  const ingredientsMatch = text.match(/## Ingredients\s*([\s\S]*?)(?=## |\n## |$)/)
  if (ingredientsMatch) sections.ingredients = ingredientsMatch[1].trim()

  const instructionsMatch = text.match(/## Instructions\s*([\s\S]*?)(?=## |\n## |$)/)
  if (instructionsMatch) sections.instructions = instructionsMatch[1].trim()

  const tipsMatch = text.match(/## Chef's Tips\s*([\s\S]*?)(?=## |\n## |$)/)
  if (tipsMatch) sections.tips = tipsMatch[1].trim()

  const nutritionMatch = text.match(/## Nutrition[\s\S]*?\n([\s\S]*?)(?=## |$)/)
  if (nutritionMatch) sections.nutrition = nutritionMatch[1].trim()

  return sections
}

function IngredientsList({ text, userIngredients }) {
  const [checked, setChecked] = useState({})
  const lines = text.split('\n').filter(l => l.trim().startsWith('-') || l.trim().startsWith('✓'))

  return (
    <ul className="space-y-2">
      {lines.map((line, i) => {
        const clean = line.replace(/^[-✓]\s*/, '').trim()
        const isOwned = line.includes('✓') || userIngredients.some(
          ui => clean.toLowerCase().includes(ui.toLowerCase())
        )
        return (
          <li key={i} className="flex items-start gap-3 group">
            <button
              onClick={() => setChecked(prev => ({ ...prev, [i]: !prev[i] }))}
              className={`mt-0.5 shrink-0 transition-all ${checked[i] ? 'text-secondary' : 'text-border hover:text-primary'}`}
              aria-label={checked[i] ? 'Uncheck ingredient' : 'Check ingredient'}
            >
              {checked[i] ? <CheckSquare size={18} /> : <Square size={18} />}
            </button>
            <span className={`text-sm leading-relaxed transition-all ${
              checked[i] ? 'line-through text-textmuted' : 'text-textdark'
            }`}>
              {isOwned && (
                <span className="inline-flex items-center mr-1.5 text-secondary text-xs font-bold">✓</span>
              )}
              {clean}
            </span>
          </li>
        )
      })}
    </ul>
  )
}

function InstructionsList({ text }) {
  const [completedSteps, setCompletedSteps] = useState({})
  const lines = text.split('\n').filter(l => l.trim().match(/^\d+\./))

  if (lines.length === 0) {
    // Try paragraph style
    const paras = text.split('\n').filter(l => l.trim())
    return (
      <ol className="space-y-4">
        {paras.map((p, i) => {
          const clean = p.replace(/^\d+\.\s*/, '').replace(/\*\*(.*?)\*\*/g, '$1')
          return (
            <li key={i} className={`flex items-start gap-4 p-3 rounded-xl transition-all cursor-pointer ${
              completedSteps[i] ? 'bg-secondary-50 opacity-60' : 'hover:bg-surface-100'
            }`} onClick={() => setCompletedSteps(p => ({ ...p, [i]: !p[i] }))}>
              <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                completedSteps[i] ? 'bg-secondary text-white' : 'bg-primary-50 text-primary'
              }`}>
                {completedSteps[i] ? '✓' : i + 1}
              </span>
              <p className="text-sm leading-relaxed text-textdark pt-0.5">{clean}</p>
            </li>
          )
        })}
      </ol>
    )
  }

  return (
    <ol className="space-y-4">
      {lines.map((line, i) => {
        const clean = line.replace(/^\d+\.\s*/, '').replace(/\*\*(.*?)\*\*/g, (_, t) => t)
        const boldMatch = line.match(/\*\*(.*?)\*\*:?\s*(.*)/)
        const title = boldMatch ? boldMatch[1] : null
        const body = boldMatch ? boldMatch[2] : clean

        return (
          <li key={i}
            className={`flex items-start gap-4 p-3 rounded-xl transition-all cursor-pointer ${
              completedSteps[i] ? 'bg-secondary-50 opacity-60' : 'hover:bg-surface-100'
            }`}
            onClick={() => setCompletedSteps(p => ({ ...p, [i]: !p[i] }))}
          >
            <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              completedSteps[i] ? 'bg-secondary text-white' : 'bg-primary-50 text-primary'
            }`}>
              {completedSteps[i] ? '✓' : i + 1}
            </span>
            <div className="flex-1 pt-0.5">
              {title && <span className="font-semibold text-textdark text-sm">{title}: </span>}
              <span className="text-sm leading-relaxed text-textdark">{body}</span>
            </div>
          </li>
        )
      })}
    </ol>
  )
}

function TipsList({ text }) {
  const lines = text.split('\n').filter(l => l.trim().startsWith('-'))
  return (
    <ul className="space-y-3">
      {lines.map((line, i) => {
        const clean = line.replace(/^-\s*/, '').trim()
        const boldMatch = clean.match(/\*\*(.*?)\*\*:?\s*(.*)/)
        const title = boldMatch ? boldMatch[1] : null
        const body = boldMatch ? boldMatch[2] : clean
        return (
          <li key={i} className="flex items-start gap-3 p-3 bg-accent-50 rounded-xl border border-accent-100">
            <span className="text-lg shrink-0">💡</span>
            <div>
              {title && <span className="font-semibold text-textdark text-sm">{title}: </span>}
              <span className="text-sm text-textmuted">{body}</span>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

export default function RecipeViewer({ suggestion, streamedText, isStreaming, onBack, onSave, isSaved }) {
  const sections = parseRecipeSections(streamedText)
  const [activeSection, setActiveSection] = useState('ingredients')
  const userIngredients = suggestion?.ingredientsUsed || []

  // Parse nutrition line: **Calories:** X | **Protein:** Xg | ...
  const nutritionItems = sections.nutrition
    ? sections.nutrition.split('|').map(n => {
        const m = n.match(/\*\*(.*?)\*\*:?\s*(.+)/)
        return m ? { label: m[1].trim(), value: m[2].trim() } : null
      }).filter(Boolean)
    : []

  return (
    <motion.div
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 35 }}
      className="min-h-screen bg-surface"
    >
      <div className="max-w-2xl mx-auto px-4 pb-20">
        {/* Back nav */}
        <div className="flex items-center gap-4 py-5">
          <button
            id="recipe-back-btn"
            onClick={onBack}
            className="btn-ghost text-sm"
          >
            <ArrowLeft size={16} />
            Back to suggestions
          </button>
          <div className="flex items-center gap-2 ml-auto">
            <button
              id="recipe-save-btn"
              onClick={() => onSave(suggestion, streamedText)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                isSaved
                  ? 'bg-primary-50 border-primary/30 text-primary'
                  : 'bg-white border-border text-textmuted hover:border-primary/30 hover:text-primary'
              }`}
            >
              <Heart size={14} className={isSaved ? 'fill-primary' : ''} />
              {isSaved ? 'Saved!' : 'Save'}
            </button>
            <button
              id="recipe-print-btn"
              onClick={() => window.print()}
              className="p-2 rounded-xl border border-border bg-white text-textmuted hover:text-textdark hover:border-primary/30 transition-all"
              aria-label="Print recipe"
            >
              <Printer size={15} />
            </button>
          </div>
        </div>

        {/* Recipe header */}
        <div className="card mb-6 overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-primary via-accent to-secondary" />
          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">{suggestion?.cuisineEmoji}</span>
              <span className="text-sm text-textmuted font-medium">{suggestion?.cuisine}</span>
              {suggestion?.difficulty && (
                <span className={`ml-auto badge ${
                  suggestion.difficulty === 'Easy' ? 'badge-easy' :
                  suggestion.difficulty === 'Medium' ? 'badge-medium' : 'badge-hard'
                }`}>
                  {suggestion.difficulty}
                </span>
              )}
            </div>

            <h1 className="font-display text-3xl sm:text-4xl font-bold text-textdark leading-tight mb-4">
              {suggestion?.name}
            </h1>

            <p className="text-textmuted text-sm leading-relaxed mb-6">{suggestion?.description}</p>

            {/* Meta stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: <Clock size={16} className="text-primary" />, label: 'Prep', value: suggestion?.prepTime },
                { icon: <ChefHat size={16} className="text-primary" />, label: 'Cook', value: suggestion?.cookTime },
                { icon: <Users size={16} className="text-primary" />, label: 'Serves', value: `${suggestion?.servings || 2}` },
                { icon: <Flame size={16} className="text-primary" />, label: 'Calories', value: suggestion?.estimatedCalories?.split(' ')[0] },
              ].map(stat => (
                <div key={stat.label} className="flex flex-col items-center p-3 bg-surface-100 rounded-xl border border-border">
                  {stat.icon}
                  <span className="font-bold text-textdark text-base mt-1">{stat.value}</span>
                  <span className="text-xs text-textmuted">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Nutrition strip */}
        {nutritionItems.length > 0 && (
          <div className="card mb-6 p-4">
            <div className="flex flex-wrap justify-around gap-3">
              {nutritionItems.map(n => (
                <div key={n.label} className="text-center">
                  <div className="font-bold text-textdark font-mono">{n.value}</div>
                  <div className="text-xs text-textmuted">{n.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab navigation */}
        <div className="flex gap-1 p-1 bg-surface-100 rounded-xl border border-border mb-6">
          {['ingredients', 'instructions', 'tips'].map(tab => (
            <button
              key={tab}
              id={`recipe-tab-${tab}`}
              onClick={() => setActiveSection(tab)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${
                activeSection === tab
                  ? 'bg-white text-primary shadow-sm border border-border'
                  : 'text-textmuted hover:text-textdark'
              }`}
            >
              {tab === 'ingredients' ? '🥕 Ingredients' :
               tab === 'instructions' ? '📋 Steps' : '💡 Tips'}
            </button>
          ))}
        </div>

        {/* Content sections */}
        <div className="card p-5 sm:p-6">
          <AnimatePresence mode="wait">
            {activeSection === 'ingredients' && (
              <motion.div key="ingredients" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                {sections.ingredients ? (
                  <IngredientsList text={sections.ingredients} userIngredients={userIngredients} />
                ) : (
                  <div className="text-center py-8 text-textmuted">
                    {isStreaming ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                        <span className="text-sm">Getting your ingredients ready...</span>
                      </div>
                    ) : 'Ingredients will appear here'}
                  </div>
                )}
              </motion.div>
            )}

            {activeSection === 'instructions' && (
              <motion.div key="instructions" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                {sections.instructions ? (
                  <>
                    <InstructionsList text={sections.instructions} />
                    {isStreaming && !sections.tips && (
                      <div className="mt-4 flex items-center gap-2 text-sm text-textmuted">
                        <span className="streaming-cursor" />
                        <span>Writing the rest of the steps...</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8 text-textmuted">
                    {isStreaming ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                        <span className="text-sm">Preparing your recipe steps...</span>
                      </div>
                    ) : 'Instructions will appear here'}
                  </div>
                )}
              </motion.div>
            )}

            {activeSection === 'tips' && (
              <motion.div key="tips" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                {sections.tips ? (
                  <TipsList text={sections.tips} />
                ) : (
                  <div className="text-center py-8 text-textmuted">
                    {isStreaming ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                        <span className="text-sm">Tips are on their way...</span>
                      </div>
                    ) : 'No tips available yet'}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Streaming raw indicator at bottom */}
        {isStreaming && (
          <div className="mt-4 flex items-center gap-2 px-4 py-3 bg-primary-50 rounded-xl border border-primary-100">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-xs text-primary font-medium">Your recipe is being written — almost done...</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}
