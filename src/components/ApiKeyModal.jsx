import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Key, ChevronDown, ChevronUp } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ApiKeyModal({ onSave }) {
  const [key, setKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [showInfo, setShowInfo] = useState(false)

  const handleSave = () => {
    const trimmed = key.trim()
    if (!trimmed) {
      toast.error('Please enter your API key')
      return
    }
    if (!trimmed.startsWith('gsk_')) {
      toast.error('This does not look like a valid key. It should start with "gsk_".')
      return
    }
    onSave(trimmed)
    toast.success('Key saved! Welcome to FridgeChef 🍳')
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(250,248,244,0.9)', backdropFilter: 'blur(12px)' }}
    >
      <motion.div
        initial={{ scale: 0.88, opacity: 0, y: 24 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="bg-white rounded-3xl border border-border max-w-md w-full p-6 sm:p-8"
        style={{ boxShadow: '0 24px 80px rgba(255,107,53,0.1), 0 4px 24px rgba(0,0,0,0.06)' }}
      >
        {/* Icon + title */}
        <div className="flex flex-col items-center mb-7">
          <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center mb-4 text-3xl shadow-sm">
            🍳
          </div>
          <h1 className="font-display text-2xl font-bold text-textdark text-center">Welcome to FridgeChef</h1>
          <p className="text-textmuted text-sm mt-1 text-center">
            One small step before we find your recipes
          </p>
        </div>

        {/* Key Input */}
        <div className="space-y-2 mb-5">
          <label className="block text-sm font-semibold text-textdark">
            Your Groq API Key
          </label>
          <div className="relative">
            <Key size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-textmuted" />
            <input
              id="groq-api-key-input"
              type={showKey ? 'text' : 'password'}
              value={key}
              onChange={e => setKey(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSave()}
              placeholder="gsk_..."
              className="w-full pl-10 pr-12 py-3.5 bg-surface rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 text-sm font-mono transition-all"
              autoFocus
            />
            <button
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-textmuted hover:text-textdark rounded-lg hover:bg-surface-100 transition-all"
              aria-label={showKey ? 'Hide key' : 'Show key'}
            >
              {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Info Accordion */}
        <div className="mb-6">
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="flex items-center gap-2 text-sm text-primary font-medium hover:text-primary-600 transition-colors"
          >
            {showInfo ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            What is this and where do I get it?
          </button>
          <AnimatePresence>
            {showInfo && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-3 p-4 bg-surface-100 rounded-xl border border-border text-sm text-textmuted space-y-2.5">
                  <p>
                    <span className="font-semibold text-textdark">Step 1:</span> Go to{' '}
                    <a href="https://console.groq.com" target="_blank" rel="noreferrer"
                      className="text-primary underline">console.groq.com</a> and sign up for free.
                  </p>
                  <p>
                    <span className="font-semibold text-textdark">Step 2:</span> Create a new API key from your dashboard.
                  </p>
                  <p>
                    <span className="font-semibold text-textdark">Step 3:</span> Paste it here. That's all.
                  </p>
                  <p className="pt-1 border-t border-border">
                    🔐 Your key is saved only in your browser. It is never shared with anyone.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* CTA */}
        <button
          id="save-api-key-btn"
          onClick={handleSave}
          className="btn-primary w-full text-base py-4"
        >
          Save and Start Cooking 🚀
        </button>

        <p className="text-center text-xs text-textmuted mt-4">
          Get a free key at{' '}
          <a href="https://console.groq.com" target="_blank" rel="noreferrer"
            className="text-primary underline hover:text-primary-600">
            console.groq.com
          </a>
        </p>
      </motion.div>
    </div>
  )
}
