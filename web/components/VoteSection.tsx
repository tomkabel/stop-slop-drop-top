'use client'

import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { Vote, Trophy, RotateCcw, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { motion, AnimatePresence } from 'framer-motion'

type VoteOption = 'a' | 'b' | 'tie'

export function VoteSection() {
  const store = useStore()

  const { outputA, outputB, userVote, isGenerating, skillA, skillB } = store

  const canVote = outputA && (outputB || !skillB)
  const hasOutput = outputA || outputB

  const handleVote = (vote: VoteOption) => {
    store.setUserVote(vote)
  }

  const handleSubmit = () => {
    store.submitExperiment()
  }

  const handleNewExperiment = () => {
    store.clearCurrentExperiment()
  }

  const voteOptions: { value: VoteOption; label: string; color: string; bgColor: string; borderColor: string; gradientStart: string; gradientEnd: string }[] = [
    { 
      value: 'a', 
      label: 'A', 
      color: 'text-output-a',
      bgColor: 'bg-output-a/10',
      borderColor: 'var(--output-a)',
      gradientStart: 'var(--output-a)',
      gradientEnd: '#7aa5c9'
    },
    { 
      value: 'tie', 
      label: '=', 
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      borderColor: 'var(--warning)',
      gradientStart: 'var(--warning)',
      gradientEnd: '#fbbf24'
    },
    { 
      value: 'b', 
      label: 'B', 
      color: 'text-output-b',
      bgColor: 'bg-output-b/10',
      borderColor: 'var(--output-b)',
      gradientStart: 'var(--output-b)',
      gradientEnd: '#d4a5d6'
    }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <Card 
        className="w-full overflow-hidden relative"
        style={{ 
          background: 'linear-gradient(180deg, var(--surface) 0%, var(--surface-elevated) 100%)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.03)'
        }}
      >
        <div 
          className="absolute top-0 left-0 right-0 h-1 opacity-80"
          style={{ 
            background: 'linear-gradient(90deg, var(--output-a), var(--accent), var(--output-b))'
          }}
        />
        <CardHeader className="pb-4 relative z-10">
          <motion.div 
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <motion.div
              whileHover={{ rotate: 15, scale: 1.1 }}
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ 
                background: 'linear-gradient(135deg, var(--accent) 0%, #d4b896 100%)',
                boxShadow: '0 4px 12px rgba(201, 166, 107, 0.3)'
              }}
            >
              <Vote className="w-5 h-5 text-background" />
            </motion.div>
            <CardTitle className="text-lg font-semibold">Vote on Results</CardTitle>
          </motion.div>
        </CardHeader>
        <CardContent>
          <AnimatePresence mode="wait">
            {!hasOutput && !isGenerating && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-10 text-text-secondary"
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-surface-elevated flex items-center justify-center opacity-50">
                    <Vote className="w-8 h-8 text-text-secondary" />
                  </div>
                  <p className="text-sm">Run an experiment to see results and vote</p>
                </motion.div>
              </motion.div>
            )}

            {isGenerating && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-10 gap-4"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ 
                    background: 'linear-gradient(135deg, var(--accent) 0%, #d4b896 100%)',
                    boxShadow: '0 4px 20px rgba(201, 166, 107, 0.4)'
                  }}
                >
                  <Loader2 className="w-6 h-6 text-background" />
                </motion.div>
                <motion.span 
                  className="text-text-secondary text-sm"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  Generating output... Please wait
                </motion.span>
              </motion.div>
            )}

            {hasOutput && !isGenerating && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {voteOptions.map((option) => {
                    const isDisabled = 
                      (option.value === 'a' && !outputA) ||
                      (option.value === 'b' && !outputB) ||
                      (option.value === 'tie' && (!outputA || !outputB))

                    const isSelected = userVote === option.value
                    const skillName = option.value === 'a' ? skillA.name : option.value === 'b' ? skillB?.name || 'SKILL B' : 'Tie'

                    return (
                      <motion.button
                        key={option.value}
                        onClick={() => handleVote(option.value)}
                        disabled={isDisabled}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={!isDisabled ? { scale: 1.03, y: -2 } : {}}
                        whileTap={!isDisabled ? { scale: 0.97 } : {}}
                        className={cn(
                          'relative flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all duration-200',
                          isSelected
                            ? 'shadow-lg'
                            : 'hover:border-border-accent',
                          isDisabled && 'opacity-40 cursor-not-allowed'
                        )}
                        style={{
                          background: isSelected 
                            ? `linear-gradient(135deg, ${option.bgColor}, transparent)`
                            : 'var(--surface-elevated)',
                          borderColor: isSelected ? option.borderColor : 'var(--border)',
                          boxShadow: isSelected 
                            ? `0 8px 24px ${option.borderColor}30, 0 0 0 1px ${option.borderColor}20 inset`
                            : '0 4px 12px rgba(0, 0, 0, 0.2)'
                        }}
                      >
                        <div 
                          className={cn(
                            'absolute top-0 left-0 right-0 h-1 rounded-t-xl opacity-0 transition-opacity duration-200',
                            isSelected && 'opacity-100'
                          )}
                          style={{ 
                            background: `linear-gradient(90deg, ${option.gradientStart}, ${option.gradientEnd})`
                          }}
                        />
                        
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                            className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center"
                            style={{
                              background: `linear-gradient(135deg, ${option.gradientStart}, ${option.gradientEnd})`,
                              boxShadow: `0 2px 8px ${option.borderColor}60`
                            }}
                          >
                            <span className="text-white text-[10px] font-bold">✓</span>
                          </motion.div>
                        )}
                        
                        <div 
                          className={cn(
                            'w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-bold transition-all duration-200',
                            isSelected ? 'scale-110' : ''
                          )}
                          style={{ 
                            background: isSelected 
                              ? `linear-gradient(135deg, ${option.gradientStart}30, ${option.gradientEnd}30)`
                              : 'var(--surface)',
                            border: `2px solid ${isSelected ? option.borderColor : 'var(--border)'}`,
                            color: isSelected ? option.color : 'var(--text-secondary)'
                          }}
                        >
                          {option.label}
                        </div>
                        
                        <span className={cn(
                          'text-xs text-center font-medium',
                          isSelected ? option.color : 'text-text-secondary'
                        )}>
                          {skillName}
                        </span>
                        
                        <AnimatePresence>
                          {isSelected && (
                            <motion.span
                              initial={{ opacity: 0, y: 5, scale: 0.9 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 5, scale: 0.9 }}
                              className={cn(
                                'text-xs font-semibold px-2 py-0.5 rounded-full',
                                option.color
                              )}
                              style={{ 
                                backgroundColor: `${option.borderColor}20`
                              }}
                            >
                              Selected
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </motion.button>
                    )
                  })}
                </div>

                <AnimatePresence mode="wait">
                  {userVote ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex gap-3"
                    >
                      <motion.div 
                        className="flex-1 relative group"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div 
                          className="absolute -inset-0.5 rounded-xl opacity-50 group-hover:opacity-100 transition-opacity duration-200"
                          style={{
                            background: 'linear-gradient(135deg, var(--accent), #d4b896)',
                            filter: 'blur(8px)'
                          }}
                        />
                        <Button
                          onClick={handleSubmit}
                          className="w-full relative z-10"
                          size="lg"
                          style={{
                            background: 'linear-gradient(135deg, var(--accent), #d4b896)',
                            boxShadow: '0 4px 16px rgba(201, 166, 107, 0.4)'
                          }}
                        >
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="flex items-center gap-2"
                          >
                            <Trophy className="w-5 h-5" />
                            <span className="font-semibold">Submit & Save</span>
                          </motion.div>
                        </Button>
                      </motion.div>
                      <Button
                        onClick={handleNewExperiment}
                        variant="outline"
                        size="lg"
                        className="px-6 hover:bg-surface-elevated/50 transition-all duration-200"
                      >
                        <RotateCcw className="w-5 h-5" />
                        <span className="ml-2">New</span>
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center py-4 px-4 rounded-xl"
                      style={{ backgroundColor: 'var(--surface-elevated)' }}
                    >
                      <p className="text-sm text-text-secondary">
                        Select which output you prefer, or mark as a tie
                      </p>
                      <div className="flex items-center justify-center gap-2 mt-2 text-xs text-text-secondary/60">
                        <kbd className="px-2 py-1 rounded bg-surface">1</kbd>
                        <span>for A</span>
                        <kbd className="px-2 py-1 rounded bg-surface ml-2">2</kbd>
                        <span>for B</span>
                        <kbd className="px-2 py-1 rounded bg-surface ml-2">3</kbd>
                        <span>for Tie</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  )
}
