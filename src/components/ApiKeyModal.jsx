import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Key, ChevronDown, ChevronUp, Zap } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ApiKeyModal({ onSave }) {
  const [key, setKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [showInfo, setShowInfo] = useState(false)

  const handleSave = () => {
    const trimmed = key.trim()
    if (!trimmed) {
      toast.error('Please enter your GROQ API key')
      return
    }
    if (!trimmed.startsWith('gsk_')) {
      toast.error('GROQ API keys start with "gsk_"')
      return
    }
    onSave(trimmed)
    toast.success('API key saved! Welcome to FridgeChef 🍳')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(250,248,244,0.85)', backdropFilter: 'blur(12px)' }}>
      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 24 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="bg-white rounded-3xl shadow-2xl border border-border max-w-md w-full p-8"
        style={{ boxShadow: '0 24px 80px rgba(255,107,53,0.12), 0 4px 24px rgba(0,0,0,0.06)' }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center mb-4 text-3xl shadow-md">
            🍳
          </div>
          <h1 className="font-display text-2xl font-bold text-textdark">Welcome to FridgeChef</h1>
          <p className="text-textmuted text-sm mt-1 text-center">
            Powered by GROQ's lightning-fast AI inference
          </p>
        </div>

        {/* GROQ Badge */}
        <div className="flex items-center justify-center gap-2 mb-6 px-4 py-2 bg-surface-100 rounded-xl border border-border">
          <Zap size={14} className="text-primary" />
          <span className="text-xs font-mono text-textmuted">GROQ — World's fastest AI inference</span>
        </div>

        {/* Key Input */}
        <div className="space-y-3 mb-6">
          <label className="block text-sm font-semibold text-textdark">
            Your GROQ API Key
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
            Why do I need this?
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
                <div className="mt-3 p-4 bg-surface-100 rounded-xl border border-border text-sm text-textmuted space-y-2">
                  <p>🔐 Your key is stored only in your browser's localStorage — never sent to any server.</p>
                  <p>⚡ GROQ provides free API access with generous rate limits at <a href="https://console.groq.com" target="_blank" rel="noreferrer" className="text-primary underline">console.groq.com</a></p>
                  <p>🤖 FridgeChef uses <span className="font-mono text-xs bg-white px-1.5 py-0.5 rounded border border-border">llama-3.3-70b-versatile</span> for ultra-fast recipe generation.</p>
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
          Start Cooking 🚀
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
