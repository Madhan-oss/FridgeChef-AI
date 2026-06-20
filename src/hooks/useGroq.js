import { useState, useCallback } from 'react'
import Groq from 'groq-sdk'
import toast from 'react-hot-toast'
import { buildSuggestionsPrompt, buildRecipePrompt } from '../utils/prompts.js'

const MODEL = 'llama-3.3-70b-versatile'

function getGroqClient(apiKey) {
  return new Groq({
    apiKey,
    dangerouslyAllowBrowser: true,
  })
}

export function useGroq() {
  const [isLoading, setIsLoading] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)

  const getSuggestions = useCallback(async (params, apiKey) => {
    if (!apiKey) {
      toast.error('Please enter your GROQ API key first')
      return null
    }

    setIsLoading(true)
    try {
      const groq = getGroqClient(apiKey)
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
        throw new Error('Invalid response format from AI')
      }

      const suggestions = JSON.parse(jsonMatch[0])
      return suggestions
    } catch (err) {
      console.error('GROQ suggestions error:', err)
      if (err.message?.includes('401') || err.message?.includes('Unauthorized') || err.message?.includes('Invalid API Key')) {
        toast.error('Invalid API key. Please check your GROQ key.')
      } else if (err.message?.includes('429')) {
        toast.error('Rate limit reached. Please wait a moment and try again.')
      } else {
        toast.error(err.message || 'Failed to get suggestions. Please try again.')
      }
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const streamRecipe = useCallback(async (params, apiKey, onChunk) => {
    if (!apiKey) {
      toast.error('Please enter your GROQ API key first')
      return
    }

    setIsStreaming(true)
    setStreamingText('')

    try {
      const groq = getGroqClient(apiKey)
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
      console.error('GROQ streaming error:', err)
      if (err.message?.includes('401') || err.message?.includes('Unauthorized')) {
        toast.error('Invalid API key. Please check your GROQ key.')
      } else {
        toast.error('Failed to stream recipe. Please try again.')
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
