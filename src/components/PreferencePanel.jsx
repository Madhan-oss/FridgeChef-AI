import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown, UtensilsCrossed, Clock, Users, Leaf } from 'lucide-react'

const CUISINES = ['Any', 'Indian', 'Italian', 'Mexican', 'Chinese', 'Mediterranean', 'Thai', 'Japanese', 'American', 'French', 'Greek']
const MEAL_TYPES = ['Any', 'Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert']
const DIETARY = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto', 'Low-Carb']
const COOKING_TIMES = ['Under 15 min', '30 min', '1 hour', 'No limit']
const SKILL_LABELS = ['Beginner', 'Intermediate', 'Chef']

export default function PreferencePanel({ prefs, onChange }) {
  return (
    <div className="space-y-5">
      {/* Cuisine */}
      <div>
        <label className="block text-xs font-semibold text-textmuted uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <UtensilsCrossed size={12} className="text-primary" />
          Cuisine
        </label>
        <div className="relative">
          <select
            id="cuisine-select"
            value={prefs.cuisine}
            onChange={e => onChange({ ...prefs, cuisine: e.target.value })}
            className="input-base text-sm pr-10 appearance-none cursor-pointer"
          >
            {CUISINES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-textmuted pointer-events-none" />
        </div>
      </div>

      {/* Meal Type */}
      <div>
        <label className="block text-xs font-semibold text-textmuted uppercase tracking-wider mb-2">
          Meal Type
        </label>
        <div className="flex flex-wrap gap-2">
          {MEAL_TYPES.map(m => (
            <button
              key={m}
              id={`meal-type-${m.toLowerCase()}`}
              onClick={() => onChange({ ...prefs, mealType: m })}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                prefs.mealType === m
                  ? 'bg-primary text-white border-primary shadow-sm'
                  : 'bg-white text-textmuted border-border hover:border-primary/30 hover:text-primary hover:bg-primary-50'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Dietary */}
      <div>
        <label className="block text-xs font-semibold text-textmuted uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Leaf size={12} className="text-secondary" />
          Dietary Restrictions
        </label>
        <div className="flex flex-wrap gap-2">
          {DIETARY.map(d => {
            const active = prefs.dietary.includes(d)
            return (
              <button
                key={d}
                id={`dietary-${d.toLowerCase().replace(/\s|-/g, '-')}`}
                onClick={() => {
                  const newDietary = active
                    ? prefs.dietary.filter(x => x !== d)
                    : [...prefs.dietary, d]
                  onChange({ ...prefs, dietary: newDietary })
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  active
                    ? 'bg-secondary text-white border-secondary shadow-sm'
                    : 'bg-white text-textmuted border-border hover:border-secondary/30 hover:text-secondary hover:bg-secondary-50'
                }`}
              >
                {active ? '✓ ' : ''}{d}
              </button>
            )
          })}
        </div>
      </div>

      {/* Skill Level */}
      <div>
        <label className="block text-xs font-semibold text-textmuted uppercase tracking-wider mb-3">
          Skill Level —{' '}
          <span className="text-primary normal-case font-bold">
            {SKILL_LABELS[prefs.skillIndex]}
          </span>
        </label>
        <div className="px-1">
          <input
            id="skill-level-slider"
            type="range"
            min="0"
            max="2"
            step="1"
            value={prefs.skillIndex}
            onChange={e => onChange({ ...prefs, skillIndex: parseInt(e.target.value) })}
            className="w-full"
            style={{ accentColor: '#FF6B35' }}
          />
          <div className="flex justify-between mt-1.5">
            {SKILL_LABELS.map((l, i) => (
              <span key={l} className={`text-xs font-medium transition-colors ${prefs.skillIndex === i ? 'text-primary' : 'text-textmuted'}`}>
                {l}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Cooking Time */}
      <div>
        <label className="block text-xs font-semibold text-textmuted uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Clock size={12} className="text-primary" />
          Cooking Time
        </label>
        <div className="flex flex-wrap gap-2">
          {COOKING_TIMES.map(t => (
            <button
              key={t}
              id={`time-${t.toLowerCase().replace(/\s/g, '-')}`}
              onClick={() => onChange({ ...prefs, cookingTime: t })}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                prefs.cookingTime === t
                  ? 'bg-accent text-textdark border-accent shadow-sm'
                  : 'bg-white text-textmuted border-border hover:border-accent/40 hover:text-textdark hover:bg-accent-50'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Servings */}
      <div>
        <label className="block text-xs font-semibold text-textmuted uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Users size={12} className="text-primary" />
          Servings
        </label>
        <div className="flex items-center gap-3">
          <button
            id="servings-decrease-btn"
            onClick={() => onChange({ ...prefs, servings: Math.max(1, prefs.servings - 1) })}
            className="w-9 h-9 rounded-full border border-border bg-white flex items-center justify-center text-textmuted hover:border-primary/40 hover:text-primary hover:bg-primary-50 transition-all text-lg font-bold leading-none"
          >
            −
          </button>
          <span className="font-mono font-bold text-xl text-textdark w-8 text-center tabular-nums">
            {prefs.servings}
          </span>
          <button
            id="servings-increase-btn"
            onClick={() => onChange({ ...prefs, servings: Math.min(10, prefs.servings + 1) })}
            className="w-9 h-9 rounded-full border border-border bg-white flex items-center justify-center text-textmuted hover:border-primary/40 hover:text-primary hover:bg-primary-50 transition-all text-lg font-bold leading-none"
          >
            +
          </button>
          <span className="text-sm text-textmuted">{prefs.servings === 1 ? 'person' : 'people'}</span>
        </div>
      </div>
    </div>
  )
}
