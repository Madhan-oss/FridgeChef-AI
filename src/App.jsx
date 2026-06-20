import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shuffle, ChefHat, UtensilsCrossed, Zap, ArrowRight, Loader2 } from 'lucide-react'
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

const HARDCODED_API_KEY = '' // Users enter their own key via the modal — stored in localStorage

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
      {/* Spinning chef hat */}
      <div className="relative">
        <div className="w-20 h-20 rounded-full bg-primary-50 border-2 border-primary/20 flex items-center justify-center">
          <span className="text-4xl animate-pulse-slow">🍳</span>
        </div>
        <div className="absolute inset-0 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
      </div>
      <p className="font-display text-xl text-textdark font-semibold">{message}</p>
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
    { emoji: '🥕', title: 'Add Ingredients', desc: 'Type what you have in your fridge and pantry' },
    { emoji: '⚡', title: 'AI Crafts Recipes', desc: "GROQ's lightning AI suggests perfect matches instantly" },
    { emoji: '🍽️', title: 'Cook & Enjoy', desc: 'Get a full recipe streaming live, step by step' },
  ]

  return (
    <div className="mt-20 mb-8">
      <p className="text-xs font-semibold text-textmuted uppercase tracking-widest text-center mb-8">How it works</p>
      <div className="grid sm:grid-cols-3 gap-4">
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
  // State
  const [apiKey, setApiKey] = useLocalStorage('fridgechef_groq_key', HARDCODED_API_KEY)
  const [showApiModal, setShowApiModal] = useState(false)
  const [ingredients, setIngredients] = useLocalStorage('fridgechef_last_ingredients', [])
  const [prefs, setPrefs] = useState(DEFAULT_PREFS)
  const [screen, setScreen] = useState('hero') // hero | builder | suggestions | recipe | saved
  const [suggestions, setSuggestions] = useState([])
  const [loadingMsg, setLoadingMsg] = useState('')
  const [selectedRecipe, setSelectedRecipe] = useState(null)
  const [streamedRecipe, setStreamedRecipe] = useState('')
  const [savedRecipes, setSavedRecipes] = useLocalStorage('fridgechef_saved', [])

  const { isLoading, isStreaming, getSuggestions, streamRecipe } = useGroq()

  // If no API key stored, show modal
  useEffect(() => {
    if (!apiKey) {
      setShowApiModal(true)
    }
  }, [apiKey])

  // Move from hero to builder when ingredient added
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
    toast.success(`🎲 Surprise! Trying ${randomPrefs.cuisine} ${randomPrefs.mealType}...`)
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
      toast.success('Updated saved recipe with full text')
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
      {/* API Key Modal */}
      <AnimatePresence>
        {showApiModal && (
          <ApiKeyModal onSave={(key) => { setApiKey(key); setShowApiModal(false) }} />
        )}
      </AnimatePresence>

      {/* Header */}
      <Header
        savedCount={savedRecipes.length}
        currentScreen={screen}
        onShowSaved={() => setScreen('saved')}
        onChangeKey={() => setShowApiModal(true)}
      />

      {/* Main content */}
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
              <div className="max-w-3xl mx-auto px-4 pt-16 sm:pt-24 pb-12">
                {/* Hero headline */}
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-center mb-12"
                >
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 border border-primary-100 rounded-full text-sm font-medium text-primary mb-6">
                    <Zap size={14} className="fill-primary" />
                    Powered by GROQ — World's fastest AI
                  </div>

                  <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-textdark leading-[1.1] mb-5">
                    What's in your{' '}
                    <span className="text-gradient">fridge?</span>
                  </h1>

                  <p className="text-textmuted text-lg sm:text-xl max-w-xl mx-auto leading-relaxed">
                    Add your ingredients and let AI craft the perfect recipe for you — streamed in real time.
                  </p>
                </motion.div>

                {/* Hero input */}
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="card p-6 mb-6"
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
              className="max-w-5xl mx-auto px-4 py-8"
            >
              <div className="mb-6">
                <h2 className="font-display text-3xl font-bold text-textdark mb-1">Build your recipe</h2>
                <p className="text-textmuted">Add more ingredients and set your preferences</p>
              </div>

              <div className="grid lg:grid-cols-5 gap-6">
                {/* Ingredients panel */}
                <div className="lg:col-span-3">
                  <div className="card p-5 sm:p-6 mb-4">
                    <h3 className="font-semibold text-textdark mb-4 flex items-center gap-2">
                      <UtensilsCrossed size={16} className="text-primary" />
                      Your Ingredients
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
                <div className="lg:col-span-2">
                  <div className="card p-5 sm:p-6">
                    <h3 className="font-semibold text-textdark mb-4 flex items-center gap-2">
                      <ChefHat size={16} className="text-primary" />
                      Preferences
                    </h3>
                    <PreferencePanel prefs={prefs} onChange={setPrefs} />
                  </div>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <button
                  id="find-recipes-btn"
                  onClick={handleFindRecipes}
                  disabled={isLoading || ingredients.length === 0}
                  className="btn-primary flex-1 py-4 text-base"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      {loadingMsg || 'Finding recipes...'}
                    </>
                  ) : (
                    <>
                      🍳 Find My Recipes
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
                <button
                  id="surprise-me-btn"
                  onClick={handleSurpriseMe}
                  disabled={isLoading || ingredients.length === 0}
                  className="btn-secondary py-4 sm:w-auto px-8 text-base"
                >
                  <Shuffle size={16} />
                  Surprise Me
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
              className="max-w-5xl mx-auto px-4 py-8"
            >
              {isLoading ? (
                <LoadingOverlay message={loadingMsg} />
              ) : (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="font-display text-3xl font-bold text-textdark mb-1">
                        Here's what you can make
                      </h2>
                      <p className="text-textmuted text-sm">
                        Based on {ingredients.length} ingredient{ingredients.length !== 1 ? 's' : ''} · {prefs.cuisine !== 'Any' ? prefs.cuisine : 'Any cuisine'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        id="back-to-builder-btn"
                        onClick={() => setScreen('builder')}
                        className="btn-ghost text-sm"
                      >
                        Edit Ingredients
                      </button>
                      <button
                        id="search-again-btn"
                        onClick={handleFindRecipes}
                        disabled={isLoading}
                        className="btn-secondary text-sm px-4 py-2"
                      >
                        <Shuffle size={14} />
                        Refresh
                      </button>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
      <footer className="border-t border-border mt-auto py-6 text-center text-xs text-textmuted">
        <span>Made with ❤ · </span>
        <span>Powered by </span>
        <span className="font-semibold text-primary">GROQ</span>
        <span> · No data stored on servers</span>
      </footer>
    </div>
  )
}
