import { Bookmark, Key, ChefHat, Utensils } from 'lucide-react'

export default function Header({ savedCount, currentScreen, onShowSaved, onChangeKey }) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <button
          id="header-logo-btn"
          onClick={() => window.location.reload()}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary-600 flex items-center justify-center text-white shadow-md">
            <ChefHat size={18} />
          </div>
          <div>
            <span className="font-display font-bold text-lg text-textdark leading-none block">FridgeChef</span>
            <span className="text-xs text-textmuted leading-none font-body">Cook What You Have</span>
          </div>
        </button>

        {/* Center breadcrumb on non-hero screens */}
        {currentScreen !== 'hero' && (
          <div className="hidden md:flex items-center gap-2 text-sm text-textmuted">
            <Utensils size={14} className="text-primary" />
            <span className="font-medium">
            {currentScreen === 'builder' && 'Add Ingredients'}
              {currentScreen === 'suggestions' && 'Recipe Ideas'}
              {currentScreen === 'recipe' && 'Recipe'}
              {currentScreen === 'saved' && 'Saved Recipes'}
            </span>
          </div>
        )}

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <button
            id="header-saved-btn"
            onClick={onShowSaved}
            className="relative flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-surface-100 text-textmuted hover:text-textdark transition-all font-medium text-sm"
            aria-label="Saved recipes"
          >
            <Bookmark size={16} />
            <span className="hidden sm:inline">Saved</span>
            {savedCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center font-bold leading-none">
                {savedCount > 9 ? '9+' : savedCount}
              </span>
            )}
          </button>

          <button
            id="header-key-btn"
            onClick={onChangeKey}
            className="p-2 rounded-xl hover:bg-surface-100 text-textmuted hover:text-textdark transition-all"
            aria-label="Change API key"
            title="Change API key"
          >
            <Key size={16} />
          </button>
        </div>
      </div>
    </header>
  )
}
