import { motion, AnimatePresence } from 'framer-motion'
import { Clock, ChefHat, Trash2, ArrowLeft, BookOpen, UtensilsCrossed } from 'lucide-react'

function EmptySavedState({ onBack }) {
  return (
    <div className="text-center py-16 sm:py-20 px-4">
      <div className="text-6xl mb-6 float-anim">🍽️</div>
      <h3 className="font-display text-2xl font-bold text-textdark mb-3">No saved recipes yet</h3>
      <p className="text-textmuted mb-8 max-w-xs mx-auto text-sm">
        Find a recipe you like and tap the heart button to save it here for later.
      </p>
      <button onClick={onBack} className="btn-primary">
        <UtensilsCrossed size={16} />
        Find Recipes
      </button>
    </div>
  )
}

export default function SavedRecipes({ recipes, onView, onDelete, onBack }) {
  return (
    <div className="max-w-4xl mx-auto px-4 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4 py-6">
        <button id="saved-back-btn" onClick={onBack} className="btn-ghost text-sm">
          <ArrowLeft size={16} />
          Back
        </button>
        <div>
          <h2 className="font-display text-2xl font-bold text-textdark">Saved Recipes</h2>
          <p className="text-sm text-textmuted">{recipes.length} recipe{recipes.length !== 1 ? 's' : ''} saved</p>
        </div>
        <div className="ml-auto">
          <BookOpen size={24} className="text-primary opacity-40" />
        </div>
      </div>

      {recipes.length === 0 ? (
        <EmptySavedState onBack={onBack} />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {recipes.map((recipe, i) => (
              <motion.div
                key={recipe.id}
                initial={{ opacity: 0, scale: 0.95, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -8 }}
                transition={{ delay: i * 0.05 }}
                className="card-hover p-5 group relative"
              >
                {/* Delete button */}
                <button
                  id={`delete-saved-${i + 1}-btn`}
                  onClick={(e) => { e.stopPropagation(); onDelete(recipe.id) }}
                  className="absolute top-4 right-4 w-7 h-7 rounded-lg border border-border bg-white text-textmuted opacity-0 group-hover:opacity-100 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all flex items-center justify-center"
                  aria-label="Delete saved recipe"
                >
                  <Trash2 size={13} />
                </button>

                <div onClick={() => onView(recipe)} className="cursor-pointer">
                  {/* Cuisine */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{recipe.cuisineEmoji || '🍳'}</span>
                    <span className="text-xs text-textmuted font-medium">{recipe.cuisine || 'Recipe'}</span>
                    {recipe.difficulty && (
                      <span className={`ml-auto badge text-xs ${
                        recipe.difficulty === 'Easy' ? 'badge-easy' :
                        recipe.difficulty === 'Medium' ? 'badge-medium' : 'badge-hard'
                      }`}>
                        {recipe.difficulty}
                      </span>
                    )}
                  </div>

                  <h3 className="font-display text-lg font-bold text-textdark mb-1 leading-tight pr-8">
                    {recipe.name}
                  </h3>

                  <p className="text-xs text-textmuted mb-3">
                    Saved {new Date(recipe.savedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>

                  <div className="flex items-center gap-3 pt-3 border-t border-border">
                    <div className="flex items-center gap-1 text-xs text-textmuted">
                      <Clock size={11} className="text-primary" />
                      <span>{recipe.prepTime}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-textmuted">
                      <ChefHat size={11} className="text-primary" />
                      <span>{recipe.cookTime}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
