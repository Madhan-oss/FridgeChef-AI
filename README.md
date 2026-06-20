# 🍳 FridgeChef — Cook What You Have

> **AI-powered recipe suggestions from ingredients you already have, streamed in real-time via GROQ.**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Madhan-oss/FridgeChef-AI)

## ✨ Features

- 🥕 **Smart Ingredient Input** — Type ingredients with autocomplete, quick-add chips, or paste comma-separated lists
- ⚡ **GROQ-Powered Streaming** — Recipes stream word-by-word at lightning speed using `llama-3.3-70b-versatile`
- 🎯 **3 Dish Suggestions** — With match scores, difficulty badges, and ingredient breakdown
- 📋 **Full Recipe Viewer** — Tabbed view: Ingredients checklist → Step-by-step instructions → Chef's tips
- ❤️ **Save Favorites** — All saved to localStorage, no account needed
- 🎲 **Surprise Me** — One-click random cuisine + preferences
- 📱 **Fully Responsive** — Mobile first, works beautifully on all screen sizes

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| React 18 + Vite | Frontend framework |
| Tailwind CSS v3 | Styling |
| Framer Motion | Animations |
| GROQ SDK | AI inference (streaming) |
| Lucide React | Icons |
| React Hot Toast | Notifications |
| localStorage | Persistence |

## 🚀 Getting Started

### 1. Clone & Install
```bash
git clone https://github.com/Madhan-oss/FridgeChef-AI.git
cd FridgeChef-AI
npm install
npm run dev
```

### 2. Get a GROQ API Key
1. Go to [console.groq.com](https://console.groq.com)
2. Sign up for free
3. Create an API key
4. Enter it in the app modal on first launch

> Your key is stored **only in your browser's localStorage** — never sent to any server.

## 🌐 Deploy to Vercel

```bash
npx vercel --prod
```

Or connect your GitHub repo at [vercel.com](https://vercel.com) → **Import Project** → auto-detected as Vite.

The `vercel.json` is already configured for SPA routing.

## 📁 Project Structure

```
src/
├── components/
│   ├── ApiKeyModal.jsx      # GROQ key entry modal
│   ├── Header.jsx           # Sticky nav with saved count
│   ├── IngredientInput.jsx  # Smart ingredient input + autocomplete
│   ├── IngredientTag.jsx    # Animated pill tags
│   ├── PreferencePanel.jsx  # Cuisine, diet, skill, time, servings
│   ├── SuggestionCard.jsx   # Recipe suggestion with match score
│   ├── RecipeViewer.jsx     # Full recipe with streaming display
│   └── SavedRecipes.jsx     # Saved recipes grid
├── hooks/
│   ├── useGroq.js           # GROQ API hook with streaming
│   └── useLocalStorage.js   # localStorage hook
├── utils/
│   └── prompts.js           # AI prompt builders
└── App.jsx                  # Main app with screen routing
```

## 🎨 Design

- **Light theme only** — warm off-white background (`#FDFCFB`)
- **Color palette**: Orange primary `#FF6B35` · Green secondary `#2D9C6B` · Golden accent `#F7C948`
- **Fonts**: Playfair Display (headings) · Inter (body) · JetBrains Mono (tags/stats)

---

Made with ❤️ · Powered by [GROQ](https://groq.com)
