'use client'

import { useStore } from '@/lib/store'
import { PROVIDERS } from '@/lib/llm-providers'
import { ExternalLink } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

export function HelpModal() {
  const store = useStore()
  const { showHelp, setShowHelp } = store

  return (
    <AnimatePresence>
      {showHelp && (
        <Dialog open={showHelp} onOpenChange={(open) => setShowHelp(open)}>
          <DialogContent 
            className="max-w-2xl max-h-[80vh] overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, var(--surface) 0%, var(--surface-elevated) 100%)',
              boxShadow: '0 24px 64px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
            }}
          >
            <div 
              className="absolute top-0 left-0 right-0 h-1 opacity-80"
              style={{ 
                background: 'linear-gradient(90deg, var(--output-a), var(--accent), var(--output-b))'
              }}
            />
            <DialogHeader className="relative z-10">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                  <motion.span
                    initial={{ rotate: -10, scale: 0 }}
                    animate={{ rotate: 0, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
                    style={{
                      background: 'linear-gradient(135deg, var(--accent), #d4b896)',
                      color: 'var(--background)'
                    }}
                  >
                    ?
                  </motion.span>
                  SKILL Lab Help
                </DialogTitle>
                <DialogDescription className="sr-only">
                  Help modal for SKILL Lab application
                </DialogDescription>
              </motion.div>
            </DialogHeader>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="overflow-y-auto max-h-[60vh] space-y-8 pr-2"
              style={{ scrollbarWidth: 'thin', scrollbarColor: 'var(--border) transparent' }}
            >
              <motion.div>
                <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                  <span className="w-1 h-5 rounded-full" style={{ background: 'var(--accent)' }} />
                  Quick Start
                </h3>
                <ol className="space-y-4">
                  {[
                    'Enter or paste text you want to transform in the input area',
                    'Configure SKILL A (and optionally SKILL B) with your writing rules',
                    'Click "Run A/B Test" to generate transformed outputs',
                    'Vote on which output you prefer and save to history'
                  ].map((step, i) => (
                    <li key={i} className="flex gap-4 items-start">
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring' as const, stiffness: 400, damping: 25 }}
                        className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold relative"
                        style={{
                          background: `linear-gradient(135deg, var(--accent) ${100 - i * 20}%, #d4b896)`,
                          boxShadow: `0 4px 12px rgba(201, 166, 107, ${0.4 - i * 0.05})`
                        }}
                      >
                        <span className="text-background">{i + 1}</span>
                        <div 
                          className="absolute -inset-0.5 rounded-xl opacity-30"
                          style={{
                            background: `linear-gradient(135deg, var(--accent), transparent)`,
                            filter: 'blur(4px)'
                          }}
                        />
                      </motion.div>
                      <span className="text-sm text-text-secondary pt-1.5">{step}</span>
                    </li>
                  ))}
                </ol>
              </motion.div>

              <motion.div>
                <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                  <span className="w-1 h-5 rounded-full" style={{ background: 'var(--output-a)' }} />
                  What is a SKILL?
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed pl-4 border-l-2" style={{ borderColor: 'var(--output-a)40' }}>
                  A SKILL is a set of writing instructions that guide the AI on how to transform text.
                  Think of it as a <span className="text-accent font-medium">"writing philosophy"</span> — different SKILLs produce different writing styles.
                  Compare two SKILLs to see which produces better results for your use case.
                </p>
              </motion.div>

              <motion.div>
                <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                  <span className="w-1 h-5 rounded-full" style={{ background: 'var(--output-b)' }} />
                  Available Providers
                </h3>
                <div className="space-y-3">
                  {Object.values(PROVIDERS).map((p, i) => (
                    <motion.div 
                      key={p.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-start gap-4 p-4 rounded-xl transition-all duration-200 hover:bg-surface-elevated/50"
                      style={{ 
                        backgroundColor: 'var(--surface-elevated)',
                        border: '1px solid var(--border)'
                      }}
                      whileHover={{ x: 4 }}
                    >
                      <span className="text-2xl mt-0.5">{p.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-text-primary">{p.name}</span>
                          {p.requiresApiKey && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-warning/20 text-warning">
                              API key required
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-text-secondary mt-0.5">{p.description}</div>
                      </div>
                    </motion.div>
                  ))}
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-start gap-4 p-4 rounded-xl transition-all duration-200 hover:bg-surface-elevated/50 relative overflow-hidden"
                    style={{ 
                      backgroundColor: 'var(--surface-elevated)',
                      border: '1px solid var(--output-a)/30'
                    }}
                    whileHover={{ x: 4 }}
                  >
                    <div 
                      className="absolute top-0 left-0 right-0 h-0.5"
                      style={{ background: 'linear-gradient(90deg, var(--output-a), var(--output-b))' }}
                    />
                    <span className="text-2xl mt-0.5">💻</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-text-primary">WebLLM (Local)</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-500/20 text-green-400">
                          Privacy-first
                        </span>
                      </div>
                      <div className="text-xs text-text-secondary mt-0.5">
                        Runs entirely in your browser. No data sent anywhere. Requires WebGPU support.
                        First use will download the model (~1GB).
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>

              <motion.div>
                <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                  <span className="w-1 h-5 rounded-full" style={{ background: 'var(--warning)' }} />
                  Privacy
                </h3>
                <div className="space-y-3 text-sm text-text-secondary pl-4 border-l-2" style={{ borderColor: 'var(--warning)/40' }}>
                  <p>
                    <strong className="text-text-primary">API Providers:</strong> Your text is sent to the respective API provider 
                    (OpenAI, Anthropic, Google, or OpenRouter) for processing.
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span>
                      <strong className="text-text-primary">WebLLM:</strong> All processing happens locally in your browser using WebLLM.
                      No data is sent to external servers.
                    </span>
                  </p>
                </div>
              </motion.div>

              <motion.div>
                <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                  <span className="w-1 h-5 rounded-full" style={{ background: 'var(--text-secondary)' }} />
                  Keyboard Shortcuts
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { keys: ['⌘', 'Enter'], action: 'Run experiment', color: 'var(--accent)' },
                    { keys: ['1'], action: 'Vote A', color: 'var(--output-a)' },
                    { keys: ['2'], action: 'Vote B', color: 'var(--output-b)' },
                    { keys: ['3'], action: 'Vote Tie', color: 'var(--warning)' },
                  ].map((shortcut, i) => (
                    <motion.div 
                      key={i}
                      className="flex items-center justify-between py-2 px-3 rounded-lg transition-all duration-200 hover:bg-surface-elevated/50"
                      style={{ backgroundColor: 'var(--surface)' }}
                      whileHover={{ x: 2 }}
                    >
                      <span className="text-sm text-text-secondary">{shortcut.action}</span>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, j) => (
                          <kbd 
                            key={j}
                            className="px-2 py-1 rounded text-xs font-mono font-medium"
                            style={{ 
                              backgroundColor: `${shortcut.color}20`,
                              color: shortcut.color,
                              border: `1px solid ${shortcut.color}40`
                            }}
                          >
                            {key}
                          </kbd>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  )
}
