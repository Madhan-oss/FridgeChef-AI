// ─── Prompt builders for GROQ API ──────────────────────────────────────────

export function buildSuggestionsPrompt({ ingredients, cuisine, mealType, dietary, skillLevel, cookingTime, servings }) {
  return `You are a professional chef. Generate exactly 3 dish suggestions as a JSON array.

Ingredients available: ${ingredients.join(', ')}
Cuisine preference: ${cuisine || 'Any'}
Meal type: ${mealType || 'Any'}
Dietary restrictions: ${dietary.length > 0 ? dietary.join(', ') : 'None'}
Skill level: ${skillLevel}
Cooking time limit: ${cookingTime}
Servings: ${servings}

Return ONLY a valid JSON array with EXACTLY this structure (no extra text, no markdown, no explanation):
[
  {
    "id": "dish_1",
    "name": "Dish Name Here",
    "cuisine": "Italian",
    "cuisineEmoji": "🇮🇹",
    "description": "A short two-sentence appetizing description of this dish.",
    "prepTime": "10 mins",
    "cookTime": "20 mins",
    "totalTime": "30 mins",
    "difficulty": "Easy",
    "estimatedCalories": "420 per serving",
    "matchScore": 87,
    "ingredientsUsed": ["egg", "tomato"],
    "extraIngredients": ["basil", "parmesan"]
  }
]

Rules:
- matchScore: integer 60-98 based on how many of the user's ingredients are used
- difficulty: must be exactly "Easy", "Medium", or "Hard"
- cuisineEmoji: use appropriate flag emoji
- Make dishes realistic and delicious
- Return ONLY the JSON array, nothing else`;
}

export function buildRecipePrompt({ dishName, ingredientsUsed, extraIngredients, servings, skillLevel, cuisine }) {
  return `You are a warm, professional chef teaching a friend. Write a complete recipe for "${dishName}".

Available ingredients the user has: ${ingredientsUsed.join(', ')}
Additional ingredients needed: ${extraIngredients.length > 0 ? extraIngredients.join(', ') : 'None — they have everything!'}
Cuisine: ${cuisine}
Servings: ${servings}
Skill level: ${skillLevel}

Write the recipe in this EXACT format with these EXACT headers:

## Ingredients

List all ingredients with precise measurements. Mark ingredients the user already has with ✓ at the start of the line.
Use bullet points (- ) for each ingredient.

## Instructions

Write ${skillLevel === 'Beginner' ? '8-10' : '6-8'} numbered steps. Each step should be detailed and clear.
Include specific temperatures (°F and °C), timing, and visual cues.
Format as:
1. **Step name:** Detailed instruction here.
2. **Step name:** Detailed instruction here.

## Chef's Tips

Share 3 professional tips to elevate this dish. Format as:
- **Tip title:** Explanation
- **Tip title:** Explanation  
- **Tip title:** Explanation

## Nutrition (estimated per serving)

Format exactly as: **Calories:** X | **Protein:** Xg | **Carbs:** Xg | **Fat:** Xg

Write warmly and encouragingly. Be specific. Make the cook feel confident.`;
}

export const LOADING_MESSAGES = [
  "Raiding your fridge... 🕵️",
  "Consulting the chef... 👨‍🍳",
  "Tasting the possibilities... 👅",
  "Combining flavors... ✨",
  "Checking the pantry... 🫙",
  "Crafting something delicious... 🍽️",
  "Whisking up ideas... 🥚",
  "The AI chef is thinking... 🤔",
  "Almost there... just seasoning... 🧂",
];
