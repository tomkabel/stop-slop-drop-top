'use client'

import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { History, Download, Trash2, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function HistoryPanel() {
  const store = useStore()
  const [isOpen, setIsOpen] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  const { experimentHistory, exportHistory, clearHistory } = store

  if (experimentHistory.length === 0) {
    return null
  }

  const handleClear = () => {
    clearHistory()
    setShowClearConfirm(false)
  }

  return (
    <>
      <Card className="overflow-hidden">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-between px-4 py-3 hover:bg-surface-elevated"
            >
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-accent" />
                <span className="text-lg font-semibold text-text-primary">
                  History ({experimentHistory.length})
                </span>
              </div>
              {isOpen ? (
                <ChevronUp className="w-5 h-5 text-text-secondary" />
              ) : (
                <ChevronDown className="w-5 h-5 text-text-secondary" />
              )}
            </Button>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <CardContent className="pt-0">
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="border-t border-border"
              >
                {/* Actions */}
                <div className="px-4 py-3 flex items-center justify-between border-b border-border">
                  <span className="text-sm text-text-secondary">
                    {experimentHistory.length} experiments
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => exportHistory('json')}
                      className="text-text-secondary hover:text-text-primary"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      JSON
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => exportHistory('csv')}
                      className="text-text-secondary hover:text-text-primary"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      CSV
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowClearConfirm(true)}
                      className="text-red-500 hover:text-red-400"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Clear
                    </Button>
                  </div>
                </div>

                {/* List */}
                <div className="max-h-64 overflow-y-auto">
                  <AnimatePresence>
                    {experimentHistory.map((exp, idx) => (
                      <motion.div
                        key={exp.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          delay: idx * 0.05,
                          duration: 0.2,
                        }}
                        className="px-4 py-3 border-b border-border last:border-b-0 hover:bg-surface-elevated transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs text-text-secondary">
                                #{experimentHistory.length - idx}
                              </span>
                              <span className="text-sm font-medium text-text-primary truncate">
                                {exp.skillA.name} vs {exp.skillB?.name || 'N/A'}
                              </span>
                            </div>
                            <div className="text-xs text-text-secondary truncate">
                              {exp.inputText.slice(0, 60)}...
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {exp.winner && (
                              <motion.span
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                                className={cn(
                                  'px-2 py-0.5 text-xs font-medium rounded',
                                  exp.winner === 'a'
                                    ? 'bg-output-a/20 text-output-a'
                                    : exp.winner === 'b'
                                    ? 'bg-output-b/20 text-output-b'
                                    : 'bg-warning/20 text-warning'
                                )}
                              >
                                {exp.winner === 'tie' ? 'Tie' : exp.winner.toUpperCase()} wins
                              </motion.span>
                            )}
                            <span className="text-xs text-text-secondary">
                              {new Date(exp.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Clear Confirmation Dialog */}
      <Dialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              Clear History
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to clear all {experimentHistory.length} experiments? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowClearConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleClear}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Clear All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}