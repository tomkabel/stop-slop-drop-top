'use client'

import { useStore } from '@/lib/store'
import { ProviderSelector } from './ProviderSelector'
import { HelpCircle, Trash2, Sparkles } from 'lucide-react'
import { motion, Variants } from 'framer-motion'

const headerVariants: Variants = {
  initial: {
    opacity: 0,
    y: -12,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  },
}

const logoVariants: Variants = {
  initial: {
    opacity: 0,
    x: -20,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      delay: 0.1,
      ease: [0.22, 1, 0.36, 1],
    },
  },
}

const controlsVariants: Variants = {
  initial: {
    opacity: 0,
    x: 20,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      delay: 0.2,
      ease: [0.22, 1, 0.36, 1],
    },
  },
}

const iconVariants: Variants = {
  initial: {
    scale: 0.8,
    opacity: 0,
  },
  animate: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.4,
      delay: 0.15,
      ease: [0.22, 1, 0.36, 1],
    },
  },
}

export function Header() {
  const setShowHelp = useStore((state) => state.setShowHelp)
  const clearCurrentExperiment = useStore((state) => state.clearCurrentExperiment)

  return (
    <motion.header
      initial="initial"
      animate="animate"
      variants={headerVariants}
      className="bg-surface/80 backdrop-blur-md border-b border-border/60 sticky top-0 z-40"
    >
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <motion.div variants={logoVariants} className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <motion.div
              variants={iconVariants}
              className="relative"
            >
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/30 flex items-center justify-center shadow-[0_0_20px_-5px_var(--accent-muted)]">
                <Sparkles className="w-5 h-5 text-accent" />
              </div>
              <div className="absolute inset-0 rounded-xl bg-accent/10 blur-md -z-10" />
            </motion.div>
            <div className="flex flex-col">
              <h1 className="text-xl font-serif font-medium text-text-primary tracking-tight">
                SKILL Lab
              </h1>
              <p className="text-xs text-text-secondary/80 -mt-0.5 font-light tracking-wide">
                A/B Writing Style Tester
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div variants={controlsVariants} className="flex items-center gap-3">
          <ProviderSelector />

          <button
            aria-label="Clear current experiment"
            onClick={clearCurrentExperiment}
            className="group p-2.5 text-text-secondary hover:text-text-primary rounded-lg transition-all duration-200 hover:bg-surface-elevated border border-transparent hover:border-border/50"
            title="Clear current experiment"
          >
            <Trash2 className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
          </button>

          <button
            aria-label="Show help"
            onClick={() => setShowHelp(true)}
            className="group p-2.5 text-text-secondary hover:text-text-primary rounded-lg transition-all duration-200 hover:bg-surface-elevated border border-transparent hover:border-border/50"
            title="Help"
          >
            <HelpCircle className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
          </button>
        </motion.div>
      </div>
    </motion.header>
  )
}