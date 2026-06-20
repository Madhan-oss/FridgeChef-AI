import { useState, useCallback } from 'react'
import Groq from 'groq-sdk'
import toast from 'react-hot-toast'
import { buildSuggestionsPrompt, buildRecipePrompt } from '../utils/prompts.js'

const MODEL = 'llama-3.3-70b-versatile'

// Read the API key from the Vite environment variable set in Vercel
const API_KEY = import.meta.env.VITE_GROQ_API_KEY || ''

function getGroqClient() {
  return new Groq({
    apiKey: API_KEY,
    dangerouslyAllowBrowser: true,
  })
}

export function useGroq() {
  const [isLoading, setIsLoading] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)

  const getSuggestions = useCallback(async (params) => {
    if (!API_KEY) {
      toast.error('Recipe service is not configured. Please contact the site owner.')
      return null
    }

    setIsLoading(true)
    try {
      const groq = getGroqClient()
      const prompt = buildSuggestionsPrompt(params)

      const response = await groq.chat.completions.create({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8,
        max_tokens: 1500,
      })

      const content = response.choices[0]?.message?.content || ''

      // Extract JSON from response
      const jsonMatch = content.match(/\[[\s\S]*\]/)
      if (!jsonMatch) {
        throw new Error('Could not read the recipe suggestions. Please try again.')
      }

      const suggestions = JSON.parse(jsonMatch[0])
      return suggestions
    } catch (err) {
      console.error('Recipe suggestions error:', err)
      if (err.message?.includes('401') || err.message?.includes('Unauthorized') || err.message?.includes('Invalid API Key')) {
        toast.error('Recipe service key is invalid. Please contact the site owner.')
      } else if (err.message?.includes('429')) {
        toast.error('Too many requests at once. Please wait a moment and try again.')
      } else {
        toast.error(err.message || 'Could not get recipe suggestions. Please try again.')
      }
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const streamRecipe = useCallback(async (params, onChunk) => {
    if (!API_KEY) {
      toast.error('Recipe service is not configured. Please contact the site owner.')
      return
    }

    setIsStreaming(true)
    setStreamingText('')

    try {
      const groq = getGroqClient()
      const prompt = buildRecipePrompt(params)

      const stream = await groq.chat.completions.create({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 2000,
        stream: true,
      })

      let fullText = ''
      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content || ''
        if (delta) {
          fullText += delta
          setStreamingText(fullText)
          onChunk?.(fullText)
        }
      }

      return fullText
    } catch (err) {
      console.error('Recipe loading error:', err)
      if (err.message?.includes('401') || err.message?.includes('Unauthorized')) {
        toast.error('Recipe service key is invalid. Please contact the site owner.')
      } else {
        toast.error('Could not load this recipe. Please try again.')
      }
      return null
    } finally {
      setIsStreaming(false)
    }
  }, [])

  return {
    isLoading,
    streamingText,
    isStreaming,
    getSuggestions,
    streamRecipe,
  }
}
