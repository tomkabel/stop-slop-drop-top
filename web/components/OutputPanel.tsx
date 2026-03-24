'use client'

import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { Copy, Check, ExternalLink, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface OutputPanelProps {
  id: 'a' | 'b'
}

export function OutputPanel({ id }: OutputPanelProps) {
  const store = useStore()
  const [copied, setCopied] = useState(false)

  const output = id === 'a' ? store.outputA : store.outputB
  const stats = id === 'a' ? store.outputAStats : store.outputBStats
  const skill = id === 'a' ? store.skillA : store.skillB
  const isGenerating = store.isGenerating && store.generatingFor === id

  const handleCopy = async () => {
    if (output) {
      await navigator.clipboard.writeText(output)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleExpand = () => {
    if (output) {
      const win = window.open('', '_blank')
      if (win) {
        win.document.write(`<html><head><title>Output ${id.toUpperCase()}</title></head><body style="font-family: monospace; white-space: pre-wrap; padding: 2rem;">${output}</body></html>`)
      }
    }
  }

  const borderColor = id === 'a' ? 'var(--output-a)' : 'var(--output-b)'
  const badgeColor = id === 'a' 
    ? 'bg-output-a/20 text-output-a border border-output-a/30' 
    : 'bg-output-b/20 text-output-b border border-output-b/30'
  const gradientStart = id === 'a' ? 'var(--output-a)' : 'var(--output-b)'
  const gradientEnd = id === 'a' ? '#7aa5c9' : '#d4a5d6'

  if (!output && !isGenerating) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <Card 
          className={cn('h-full min-h-[320px] border-l-4 overflow-hidden relative')}
          style={{ 
            background: 'linear-gradient(180deg, var(--surface) 0%, var(--surface-elevated) 100%)',
            borderLeftColor: borderColor,
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.2)'
          }}
        >
          <div 
            className="absolute top-0 left-0 right-0 h-1 opacity-60"
            style={{ 
              background: `linear-gradient(90deg, ${gradientStart}, ${gradientEnd})`
            }}
          />
          <div className="h-full flex items-center justify-center relative z-10">
            <motion.div 
              className="text-center"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div 
                className="w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center text-4xl font-bold"
                style={{ 
                  background: `linear-gradient(135deg, ${gradientStart}20, ${gradientEnd}20)`,
                  border: `2px solid ${borderColor}40`,
                  color: borderColor
                }}
              >
                {id === 'a' ? 'A' : 'B'}
              </div>
              <div className="text-sm text-text-secondary">Output will appear here</div>
              <div className="text-xs text-text-secondary/50 mt-1">Run an experiment to generate</div>
            </motion.div>
          </div>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <Card 
        className="overflow-hidden relative"
        style={{ 
          background: 'linear-gradient(180deg, var(--surface) 0%, var(--surface-elevated) 100%)',
          borderLeft: `4px solid ${borderColor}`,
          boxShadow: `0 4px 24px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.03)`
        }}
      >
        <div 
          className="absolute top-0 left-0 right-0 h-1 opacity-80"
          style={{ 
            background: `linear-gradient(90deg, ${gradientStart}, ${gradientEnd})`
          }}
        />
        <CardHeader className="pb-3 relative z-10">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center gap-2"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <span 
                className={cn('px-3 py-1 text-xs font-bold rounded-lg', badgeColor)}
                style={{ backdropFilter: 'blur(8px)' }}
              >
                OUTPUT {id.toUpperCase()}
              </span>
              <span className="text-sm text-text-secondary">
                {skill?.name || 'Unknown'}
              </span>
            </motion.div>

            <AnimatePresence>
              {isGenerating && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs"
                  style={{ 
                    backgroundColor: 'var(--surface-elevated)',
                    color: 'var(--accent)'
                  }}
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <Loader2 className="w-3 h-3" />
                  </motion.div>
                  <span className="font-medium">Generating...</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CardHeader>

        <CardContent 
          className="min-h-[200px] max-h-[400px] overflow-y-auto relative z-10"
          style={{ scrollbarWidth: 'thin', scrollbarColor: 'var(--border) transparent' }}
        >
          <AnimatePresence mode="wait">
            {isGenerating && !output ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4 pt-2"
              >
                {[1, 2, 3, 4].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0.5, x: -20 }}
                    animate={{ 
                      opacity: [0.5, 0.8, 0.5],
                      x: 0
                    }}
                    transition={{
                      duration: 1.8,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: i * 0.1
                    }}
                    className="h-5 rounded-lg"
                    style={{ 
                      width: `${50 + (i * 10) % 40}%`,
                      background: `linear-gradient(90deg, var(--surface-elevated) 0%, ${borderColor}30 50%, var(--surface-elevated) 100%)`,
                      backgroundSize: '200% 100%',
                    }}
                  />
                ))}
              </motion.div>
            ) : (
              <motion.pre
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-text-primary/90"
              >
                {output || ''}
              </motion.pre>
            )}
          </AnimatePresence>
        </CardContent>

        <AnimatePresence>
          {stats && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3 }}
            >
              <CardFooter 
                className="py-3 flex items-center justify-between text-xs relative z-10"
                style={{ 
                  borderTop: '1px solid var(--border)',
                  backgroundColor: 'var(--surface)'
                }}
              >
                <motion.div 
                  className="text-text-secondary"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <span className="font-mono">{stats.chars.toLocaleString()}</span> chars
                  <span className="mx-2 opacity-50">•</span>
                  <span className="font-mono">{stats.timeMs}</span>ms
                </motion.div>
                <motion.div 
                  className="flex items-center gap-1"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopy}
                    disabled={!output}
                    className={cn(
                      "h-8 px-3 gap-1.5 transition-all duration-200",
                      copied && "text-green-500"
                    )}
                    style={{ 
                      backgroundColor: copied ? 'rgba(34, 197, 94, 0.1)' : 'transparent'
                    }}
                  >
                    <motion.div
                      animate={copied ? { scale: [1, 1.2, 1] } : {}}
                      transition={{ duration: 0.2 }}
                    >
                      {copied ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </motion.div>
                    <span className="text-xs font-medium">
                      {copied ? 'Copied!' : 'Copy'}
                    </span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleExpand}
                    disabled={!output}
                    className="h-8 px-3 gap-1.5 hover:bg-surface-elevated/50 transition-all duration-200"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span className="text-xs font-medium">Expand</span>
                  </Button>
                </motion.div>
              </CardFooter>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  )
}
