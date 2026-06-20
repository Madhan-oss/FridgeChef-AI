import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shuffle, ChefHat, UtensilsCrossed, Sparkles, ArrowRight, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

import Header from './components/Header.jsx'
import ApiKeyModal from './components/ApiKeyModal.jsx'
import IngredientInput from './components/IngredientInput.jsx'
import PreferencePanel from './components/PreferencePanel.jsx'
import SuggestionCard from './components/SuggestionCard.jsx'
import RecipeViewer from './components/RecipeViewer.jsx'
import SavedRecipes from './components/SavedRecipes.jsx'

import { useGroq } from './hooks/useGroq.js'
import { useLocalStorage } from './hooks/useLocalStorage.js'
import { LOADING_MESSAGES } from './utils/prompts.js'

const DEFAULT_PREFS = {
  cuisine: 'Any',
  mealType: 'Any',
  dietary: [],
  skillIndex: 0,
  cookingTime: 'No limit',
  servings: 2,
}

const SKILL_MAP = ['Beginner', 'Intermediate', 'Chef']
const RANDOM_CUISINES = ['Indian', 'Italian', 'Mexican', 'Chinese', 'Mediterranean', 'Thai', 'Japanese', 'American']
const RANDOM_MEALS = ['Breakfast', 'Lunch', 'Dinner', 'Snack']

function LoadingOverlay({ message }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-6">
      <div className="relative">
        <div className="w-20 h-20 rounded-full bg-primary-50 border-2 border-primary/20 flex items-center justify-center">
          <span className="text-4xl animate-pulse-slow">🍳</span>
        </div>
        <div className="absolute inset-0 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
      </div>
      <p className="font-display text-xl text-textdark font-semibold text-center px-4">{message}</p>
      <div className="flex gap-1.5">
        {[0, 1, 2].map(i => (
          <div key={i} className="w-2 h-2 bg-primary rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
    </div>
  )
}

function HowItWorksSection() {
  const steps = [
    { emoji: '🥕', title: 'Add Your Ingredients', desc: 'Type what you have in your fridge and pantry — even leftovers count.' },
    { emoji: '✨', title: 'Get Recipe Ideas', desc: 'We suggest three dishes you can make right now, with a match score for each.' },
    { emoji: '🍽️', title: 'Cook and Enjoy', desc: 'Open a recipe, follow the step-by-step guide, and get cooking.' },
  ]

  return (
    <div className="mt-16 mb-8">
      <p className="text-xs font-semibold text-textmuted uppercase tracking-widest text-center mb-8">How it works</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {steps.map((s, i) => (
          <motion.div key={s.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + i * 0.1 }}
            className="card p-5 text-center">
            <div className="text-3xl mb-3">{s.emoji}</div>
            <h4 className="font-semibold text-textdark mb-1 text-sm">{s.title}</h4>
            <p className="text-xs text-textmuted leading-relaxed">{s.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default function App() {
  const [apiKey, setApiKey] = useLocalStorage('fridgechef_groq_key', '')
  const [showApiModal, setShowApiModal] = useState(false)
  const [ingredients, setIngredients] = useLocalStorage('fridgechef_last_ingredients', [])
  const [prefs, setPrefs] = useState(DEFAULT_PREFS)
  const [screen, setScreen] = useState('hero')
  const [suggestions, setSuggestions] = useState([])
  const [loadingMsg, setLoadingMsg] = useState('')
  const [selectedRecipe, setSelectedRecipe] = useState(null)
  const [streamedRecipe, setStreamedRecipe] = useState('')
  const [savedRecipes, setSavedRecipes] = useLocalStorage('fridgechef_saved', [])

  const { isLoading, isStreaming, getSuggestions, streamRecipe } = useGroq()

  useEffect(() => {
    if (!apiKey) {
      setShowApiModal(true)
    }
  }, [apiKey])

  const handleAddIngredient = (name) => {
    if (!ingredients.includes(name)) {
      const updated = [...ingredients, name]
      setIngredients(updated)
      if (screen === 'hero') setScreen('builder')
    }
  }

  const handleRemoveIngredient = (name) => {
    const updated = ingredients.filter(i => i !== name)
    setIngredients(updated)
    if (updated.length === 0 && screen === 'builder') setScreen('hero')
  }

  const handleClearIngredients = () => {
    setIngredients([])
    setScreen('hero')
  }

  const handleFindRecipes = async () => {
    if (ingredients.length === 0) {
      toast.error('Add at least one ingredient first!')
      return
    }
    const msgs = LOADING_MESSAGES
    let msgIdx = 0
    setLoadingMsg(msgs[msgIdx])
    const interval = setInterval(() => {
      msgIdx = (msgIdx + 1) % msgs.length
      setLoadingMsg(msgs[msgIdx])
    }, 1800)

    const result = await getSuggestions({
      ingredients,
      cuisine: prefs.cuisine,
      mealType: prefs.mealType,
      dietary: prefs.dietary,
      skillLevel: SKILL_MAP[prefs.skillIndex],
      cookingTime: prefs.cookingTime,
      servings: prefs.servings,
    }, apiKey)

    clearInterval(interval)
    if (result && result.length > 0) {
      setSuggestions(result)
      setScreen('suggestions')
    }
  }

  const handleSurpriseMe = async () => {
    if (ingredients.length === 0) {
      toast.error('Add at least one ingredient first!')
      return
    }
    const randomPrefs = {
      ...DEFAULT_PREFS,
      cuisine: RANDOM_CUISINES[Math.floor(Math.random() * RANDOM_CUISINES.length)],
      mealType: RANDOM_MEALS[Math.floor(Math.random() * RANDOM_MEALS.length)],
      skillIndex: Math.floor(Math.random() * 3),
      cookingTime: ['Under 15 min', '30 min', '1 hour', 'No limit'][Math.floor(Math.random() * 4)],
    }
    setPrefs(randomPrefs)
    toast.success(`🎲 Picking a random recipe — let's see what we get!`)
    await handleFindRecipesWithPrefs(randomPrefs)
  }

  const handleFindRecipesWithPrefs = async (usePrefs) => {
    const msgs = LOADING_MESSAGES
    let msgIdx = 0
    setLoadingMsg(msgs[msgIdx])
    const interval = setInterval(() => {
      msgIdx = (msgIdx + 1) % msgs.length
      setLoadingMsg(msgs[msgIdx])
    }, 1800)

    const result = await getSuggestions({
      ingredients,
      cuisine: usePrefs.cuisine,
      mealType: usePrefs.mealType,
      dietary: usePrefs.dietary,
      skillLevel: SKILL_MAP[usePrefs.skillIndex],
      cookingTime: usePrefs.cookingTime,
      servings: usePrefs.servings,
    }, apiKey)

    clearInterval(interval)
    if (result && result.length > 0) {
      setSuggestions(result)
      setScreen('suggestions')
    }
  }

  const handleViewRecipe = async (suggestion) => {
    setSelectedRecipe({ ...suggestion, servings: prefs.servings })
    setStreamedRecipe('')
    setScreen('recipe')

    await streamRecipe({
      dishName: suggestion.name,
      ingredientsUsed: suggestion.ingredientsUsed,
      extraIngredients: suggestion.extraIngredients,
      servings: prefs.servings,
      skillLevel: SKILL_MAP[prefs.skillIndex],
      cuisine: suggestion.cuisine,
    }, apiKey, (text) => {
      setStreamedRecipe(text)
    })
  }

  const handleSaveSuggestion = (suggestion) => {
    const exists = savedRecipes.find(r => r.id === suggestion.id)
    if (exists) {
      setSavedRecipes(savedRecipes.filter(r => r.id !== suggestion.id))
      toast.success('Removed from saved recipes')
    } else {
      const saved = {
        ...suggestion,
        savedAt: new Date().toISOString(),
        fullRecipe: '',
        servings: prefs.servings,
      }
      setSavedRecipes([saved, ...savedRecipes])
      toast.success(`${suggestion.name} saved! ❤`)
    }
  }

  const handleSaveFullRecipe = (suggestion, recipeText) => {
    const exists = savedRecipes.find(r => r.id === suggestion.id)
    if (exists) {
      setSavedRecipes(savedRecipes.map(r =>
        r.id === suggestion.id ? { ...r, fullRecipe: recipeText } : r
      ))
      toast.success('Recipe saved to your collection')
    } else {
      const saved = {
        ...suggestion,
        savedAt: new Date().toISOString(),
        fullRecipe: recipeText,
        servings: prefs.servings,
      }
      setSavedRecipes([saved, ...savedRecipes])
      toast.success(`${suggestion.name} saved! ❤`)
    }
  }

  const handleViewSaved = (recipe) => {
    setSelectedRecipe(recipe)
    setStreamedRecipe(recipe.fullRecipe || '')
    setScreen('recipe')
  }

  const handleDeleteSaved = (id) => {
    setSavedRecipes(savedRecipes.filter(r => r.id !== id))
    toast.success('Recipe removed')
  }

  const isSaved = (id) => savedRecipes.some(r => r.id === id)

  return (
    <div className="min-h-screen bg-surface">
      <AnimatePresence>
        {showApiModal && (
          <ApiKeyModal onSave={(key) => { setApiKey(key); setShowApiModal(false) }} />
        )}
      </AnimatePresence>

      <Header
        savedCount={savedRecipes.length}
        currentScreen={screen}
        onShowSaved={() => setScreen('saved')}
        onChangeKey={() => setShowApiModal(true)}
      />

      <main>
        <AnimatePresence mode="wait">

          {/* ── HERO SCREEN ── */}
          {screen === 'hero' && (
            <motion.div key="hero"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -16 }}
              className="bg-hero-pattern min-h-[calc(100vh-64px)]"
            >
              <div className="max-w-3xl mx-auto px-4 pt-12 sm:pt-20 pb-12">
                {/* Hero headline */}
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-center mb-10"
                >
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 border border-primary-100 rounded-full text-sm font-medium text-primary mb-6">
                    <Sparkles size={14} />
                    Quick recipe ideas from what you already have
                  </div>

                  <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-textdark leading-[1.1] mb-5">
                    What's in your{' '}
                    <span className="text-gradient">fridge?</span>
                  </h1>

                  <p className="text-textmuted text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
                    Tell us what ingredients you have and we'll suggest three dishes you can make right now — with full step-by-step recipes.
                  </p>
                </motion.div>

                {/* Hero input */}
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="card p-4 sm:p-6 mb-6"
                >
                  <IngredientInput
                    ingredients={ingredients}
                    onAdd={handleAddIngredient}
                    onRemove={handleRemoveIngredient}
                    onClear={handleClearIngredients}
                  />
                </motion.div>

                <HowItWorksSection />
              </div>
            </motion.div>
          )}

          {/* ── BUILDER SCREEN ── */}
          {screen === 'builder' && (
            <motion.div key="builder"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="max-w-5xl mx-auto px-4 py-6 sm:py-8"
            >
              <div className="mb-5">
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-textdark mb-1">Your ingredients</h2>
                <p className="text-textmuted text-sm sm:text-base">Add more items and set your cooking preferences below</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
                {/* Ingredients panel */}
                <div className="lg:col-span-3 order-1">
                  <div className="card p-4 sm:p-6">
                    <h3 className="font-semibold text-textdark mb-4 flex items-center gap-2 text-sm sm:text-base">
                      <UtensilsCrossed size={16} className="text-primary shrink-0" />
                      What you have
                    </h3>
                    <IngredientInput
                      ingredients={ingredients}
                      onAdd={handleAddIngredient}
                      onRemove={handleRemoveIngredient}
                      onClear={handleClearIngredients}
                    />
                  </div>
                </div>

                {/* Preferences panel */}
                <div className="lg:col-span-2 order-2">
                  <div className="card p-4 sm:p-6">
                    <h3 className="font-semibold text-textdark mb-4 flex items-center gap-2 text-sm sm:text-base">
                      <ChefHat size={16} className="text-primary shrink-0" />
                      Cooking preferences
                    </h3>
                    <PreferencePanel prefs={prefs} onChange={setPrefs} />
                  </div>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3 mt-5">
                <button
                  id="find-recipes-btn"
                  onClick={handleFindRecipes}
                  disabled={isLoading || ingredients.length === 0}
                  className="btn-primary flex-1 py-4 text-base"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={18} className="animate-spin shrink-0" />
                      <span className="truncate">{loadingMsg || 'Finding recipes...'}</span>
                    </>
                  ) : (
                    <>
                      🍳 Find Recipes
                      <ArrowRight size={18} className="shrink-0" />
                    </>
                  )}
                </button>
                <button
                  id="surprise-me-btn"
                  onClick={handleSurpriseMe}
                  disabled={isLoading || ingredients.length === 0}
                  className="btn-secondary py-4 sm:w-auto sm:px-8 text-base"
                >
                  <Shuffle size={16} className="shrink-0" />
                  Pick for Me
                </button>
              </div>
            </motion.div>
          )}

          {/* ── SUGGESTIONS SCREEN ── */}
          {screen === 'suggestions' && (
            <motion.div key="suggestions"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-5xl mx-auto px-4 py-6 sm:py-8"
            >
              {isLoading ? (
                <LoadingOverlay message={loadingMsg} />
              ) : (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                    <div>
                      <h2 className="font-display text-2xl sm:text-3xl font-bold text-textdark mb-1">
                        Here's what you can make
                      </h2>
                      <p className="text-textmuted text-sm">
                        Using {ingredients.length} ingredient{ingredients.length !== 1 ? 's' : ''}
                        {prefs.cuisine !== 'Any' ? ` · ${prefs.cuisine} food` : ''}
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        id="back-to-builder-btn"
                        onClick={() => setScreen('builder')}
                        className="btn-ghost text-sm"
                      >
                        Edit ingredients
                      </button>
                      <button
                        id="search-again-btn"
                        onClick={handleFindRecipes}
                        disabled={isLoading}
                        className="btn-secondary text-sm px-4 py-2"
                      >
                        <Shuffle size={14} />
                        Try again
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                    {suggestions.map((s, i) => (
                      <SuggestionCard
                        key={s.id || i}
                        suggestion={s}
                        index={i}
                        onView={handleViewRecipe}
                        onSave={handleSaveSuggestion}
                        isSaved={isSaved(s.id)}
                      />
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* ── RECIPE SCREEN ── */}
          {screen === 'recipe' && selectedRecipe && (
            <RecipeViewer
              key="recipe"
              suggestion={selectedRecipe}
              streamedText={streamedRecipe}
              isStreaming={isStreaming}
              onBack={() => setScreen('suggestions')}
              onSave={handleSaveFullRecipe}
              isSaved={isSaved(selectedRecipe.id)}
            />
          )}

          {/* ── SAVED SCREEN ── */}
          {screen === 'saved' && (
            <motion.div key="saved"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
            >
              <SavedRecipes
                recipes={savedRecipes}
                onView={handleViewSaved}
                onDelete={handleDeleteSaved}
                onBack={() => setScreen(suggestions.length > 0 ? 'suggestions' : ingredients.length > 0 ? 'builder' : 'hero')}
              />
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-auto py-6 text-center text-xs text-textmuted px-4">
        <span>Made with ❤ by FridgeChef</span>
        <span className="mx-2">·</span>
        <span>Your data stays on your device</span>
      </footer>
    </div>
  )
}
