'use client'

import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { FileText, Link, Trash2, Loader2, AlertCircle } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'

const inputSchema = z.object({
  text: z.string().min(10, 'Please enter at least 10 characters for analysis'),
})

type InputFormData = z.infer<typeof inputSchema>

const samples = [
  { key: 'ai' as const, label: 'AI-generated', desc: 'Typical AI writing with patterns' },
  { key: 'academic' as const, label: 'Academic', desc: 'Formal scholarly prose' },
  { key: 'marketing' as const, label: 'Marketing', desc: 'Sales copy with hype' },
  { key: 'technical' as const, label: 'Technical', desc: 'Documentation style' },
]

export function TextInput() {
  const inputText = useStore(state => state.inputText)
  const setInputText = useStore(state => state.setInputText)
  const loadSampleText = useStore(state => state.loadSampleText)
  
  const [showSamples, setShowSamples] = useState(false)
  const [isLoadingUrl, setIsLoadingUrl] = useState(false)
  const [urlError, setUrlError] = useState<string | null>(null)

  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useForm<InputFormData>({
    defaultValues: { text: inputText },
    mode: 'onChange',
  })

  useEffect(() => {
    const subscription = watch((value) => {
      if (value.text !== undefined) {
        setInputText(value.text)
      }
    })
    return () => subscription.unsubscribe()
  }, [watch, setInputText])

  const handleLoadSample = (key: 'ai' | 'academic' | 'marketing' | 'technical') => {
    loadSampleText(key)
    setValue('text', useStore.getState().inputText)
    setShowSamples(false)
  }

  const handleLoadFromUrl = async () => {
    const url = prompt('Enter URL to fetch text from:')
    if (!url) return

    setUrlError(null)
    setIsLoadingUrl(true)

    try {
      const urlObj = new URL(url)
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        setUrlError('Only HTTP/HTTPS URLs are allowed')
        return
      }
    } catch {
      setUrlError('Invalid URL')
      setIsLoadingUrl(false)
      return
    }

    try {
      const res = await fetch(url)
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
      }
      
      const contentType = res.headers.get('content-type') || ''
      if (!contentType.includes('text/') && !contentType.includes('application/json')) {
        throw new Error('Invalid content type')
      }

      const text = await res.text()
      
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = text
      const plainText = tempDiv.textContent || tempDiv.innerText || ''
      
      const truncatedText = plainText.slice(0, 5000)
      setInputText(truncatedText)
      setValue('text', truncatedText)
    } catch (err) {
      console.error('Failed to load URL:', err)
      setUrlError('Failed to fetch URL. Ensure it allows CORS and contains text content.')
    } finally {
      setIsLoadingUrl(false)
    }
  }

  const handleClear = () => {
    setInputText('')
    setValue('text', '')
    setUrlError(null)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      document.getElementById('run-button')?.click()
    }
  }

  const textValue = watch('text') || ''
  const charCount = textValue.length
  const hasContent = charCount > 0

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">Input Text</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Textarea
            {...register('text')}
            placeholder="Enter text to transform... paste an AI-written paragraph to see how different SKILLs rewrite it."
            className={cn(
              "h-48 resize-none pr-16",
              errors.text && "border-destructive focus-visible:ring-destructive"
            )}
            onKeyDown={handleKeyDown}
          />
          <div className={cn(
            "absolute bottom-3 right-3 text-xs flex items-center gap-1",
            charCount > 4500 ? "text-destructive" : "text-muted-foreground"
          )}>
            {charCount > 4500 && <AlertCircle className="w-3 h-3" />}
            {charCount}/5000
          </div>
        </div>

        <AnimatePresence>
          {errors.text && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2 text-sm text-destructive"
            >
              <AlertCircle className="w-4 h-4" />
              {errors.text.message}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {urlError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2 text-sm text-destructive"
            >
              <AlertCircle className="w-4 h-4" />
              {urlError}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSamples(!showSamples)}
                disabled={isLoadingUrl}
              >
                <FileText className="w-4 h-4" />
                Load Sample
              </Button>

              <AnimatePresence>
                {showSamples && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 top-full mt-1 w-64 bg-popover border border-border rounded-lg shadow-xl z-40"
                  >
                    {samples.map((sample, index) => (
                      <motion.button
                        key={sample.key}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => handleLoadSample(sample.key)}
                        className="w-full text-left px-4 py-3 hover:bg-accent/10 transition-colors first:rounded-t-lg last:rounded-b-lg"
                      >
                        <div className="text-sm font-medium">{sample.label}</div>
                        <div className="text-xs text-muted-foreground">{sample.desc}</div>
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleLoadFromUrl}
              disabled={isLoadingUrl}
            >
              {isLoadingUrl ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Link className="w-4 h-4" />
              )}
              Load from URL
            </Button>

            {hasContent && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                disabled={isLoadingUrl}
              >
                <Trash2 className="w-4 h-4" />
                Clear
              </Button>
            )}
          </div>

          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 text-[10px] bg-muted rounded">⌘</kbd>
            <span>+</span>
            <kbd className="px-1.5 py-0.5 text-[10px] bg-muted rounded">Enter</kbd>
            <span>to run</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}