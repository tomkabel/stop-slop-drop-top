'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '@/lib/store'
import { Header } from '@/components/Header'
import { TextInput } from '@/components/TextInput'
import { SkillPanel } from '@/components/SkillPanel'
import { OutputPanel } from '@/components/OutputPanel'
import { VoteSection } from '@/components/VoteSection'
import { HistoryPanel } from '@/components/HistoryPanel'
import { HelpModal } from '@/components/HelpModal'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Button } from '@/components/ui/button'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Play, Loader2, AlertCircle } from 'lucide-react'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

export default function Home() {
  const inputText = useStore(state => state.inputText)
  const skillA = useStore(state => state.skillA)
  const isGenerating = useStore(state => state.isGenerating)
  const error = useStore(state => state.error)
  const outputA = useStore(state => state.outputA)
  const outputB = useStore(state => state.outputB)
  const showHelp = useStore(state => state.showHelp)
  const userVote = useStore(state => state.userVote)
  const loadModel = useStore(state => state.loadModel)
  const runExperiment = useStore(state => state.runExperiment)
  const clearError = useStore(state => state.clearError)
  const setUserVote = useStore(state => state.setUserVote)
  const setShowHelp = useStore(state => state.setShowHelp)

  useEffect(() => {
    loadModel()
  }, [loadModel])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isModEnter = (e.metaKey || e.ctrlKey) && e.key === 'Enter'
      
      if (isModEnter) {
        e.preventDefault()
        runExperiment()
        return
      }

      if (e.key === '1') {
        e.preventDefault()
        setUserVote('a')
        return
      }

      if (e.key === '2') {
        e.preventDefault()
        setUserVote('b')
        return
      }

      if (e.key === '3') {
        e.preventDefault()
        setUserVote('tie')
        return
      }

      if (e.key === '?' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        setShowHelp(true)
        return
      }

      if (e.key === 'Escape') {
        e.preventDefault()
        if (showHelp) {
          setShowHelp(false)
        }
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [runExperiment, setUserVote, setShowHelp, showHelp])

  const canRun = inputText.trim().length > 0 && skillA.content.trim().length > 0 && !isGenerating

  return (
    <ErrorBoundary>
      <TooltipProvider>
        <div className="min-h-screen bg-background bg-noise">
          <Header />

          <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-3 px-5 py-4 bg-accent/10 border border-accent/25 rounded-xl shadow-sm"
                >
                  <AlertCircle className="w-5 h-5 text-accent flex-shrink-0" />
                  <div className="flex-1 text-sm text-accent font-medium">{error}</div>
                  <button
                    onClick={clearError}
                    className="text-sm text-accent/80 hover:text-accent transition-colors duration-200 underline-offset-2 hover:underline"
                  >
                    Dismiss
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="space-y-8"
            >
              <motion.div variants={fadeInUp}>
                <ErrorBoundary>
                  <TextInput />
                </ErrorBoundary>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <section>
                  <h2 className="text-sm font-semibold text-text-secondary mb-4 uppercase tracking-widest">
                    Skill Configuration
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ErrorBoundary>
                      <SkillPanel id="a" />
                    </ErrorBoundary>
                    <ErrorBoundary>
                      <SkillPanel id="b" />
                    </ErrorBoundary>
                  </div>
                </section>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <div className="flex items-center justify-center py-6">
                  <Button
                    id="run-button"
                    aria-label="Run A/B test"
                    onClick={runExperiment}
                    disabled={!canRun}
                    size="lg"
                    className="group relative flex items-center gap-3 px-12 py-5 bg-accent hover:bg-accent-hover disabled:bg-surface-elevated disabled:text-text-muted text-background font-semibold text-lg rounded-xl transition-all duration-200 disabled:cursor-not-allowed hover:shadow-glow-lg disabled:hover:shadow-none overflow-hidden"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 -translate-x-full group-hover:translate-x-full" />
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" />
                        <span>Run A/B Test</span>
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>

              <motion.div variants={fadeInUp}>
                {(outputA || outputB || isGenerating) && (
                  <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ErrorBoundary>
                      <OutputPanel id="a" />
                    </ErrorBoundary>
                    <ErrorBoundary>
                      <OutputPanel id="b" />
                    </ErrorBoundary>
                  </section>
                )}
              </motion.div>

              <motion.div variants={fadeInUp}>
                {(outputA || outputB || isGenerating) && (
                  <ErrorBoundary>
                    <VoteSection />
                  </ErrorBoundary>
                )}
              </motion.div>

              <motion.div variants={fadeInUp}>
                <ErrorBoundary>
                  <HistoryPanel />
                </ErrorBoundary>
              </motion.div>
            </motion.div>
          </main>

          <HelpModal />

          <footer className="border-t border-border/50 mt-20">
            <div className="max-w-7xl mx-auto px-4 py-12 text-center">
              <p className="font-serif text-2xl text-text-secondary tracking-wide">SKILL Lab</p>
              <p className="text-sm text-text-muted mt-3 tracking-wide">In-browser AI writing analysis. No data leaves your device.</p>
              <div className="mt-6 pt-6 border-t border-border/30">
                <p className="text-xs text-text-muted/60 uppercase tracking-widest">Powered by local AI</p>
              </div>
            </div>
          </footer>
        </div>
      </TooltipProvider>
    </ErrorBoundary>
  )
}
