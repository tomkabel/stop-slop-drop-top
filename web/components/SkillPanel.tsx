'use client'

import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Upload, FileText, X, ArrowLeftRight, AlertCircle } from 'lucide-react'
import { useRef } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'

const skillSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  content: z.string().min(50, 'Content must be at least 50 characters').max(10000, 'Content must be less than 10000 characters'),
})

type SkillFormData = z.infer<typeof skillSchema>

interface SkillPanelProps {
  id: 'a' | 'b'
}

export function SkillPanel({ id }: SkillPanelProps) {
  const store = useStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const skill = id === 'a' ? store.skillA : store.skillB
  const setName = id === 'a' ? store.setSkillAName : store.setSkillBName
  const setContent = id === 'a' ? store.setSkillAContent : store.setSkillBContent

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<SkillFormData>({
    defaultValues: {
      name: skill?.name || '',
      content: skill?.content || '',
    },
    mode: 'onChange',
  })

  const contentValue = watch('content') || ''
  const nameValue = watch('name') || ''

  const isTooShort = contentValue.length > 0 && contentValue.length < 200
  const isValidLength = contentValue.length >= 50

  if (id === 'b' && !skill) {
    return (
      <motion.button
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.02, borderColor: 'var(--output-a)' }}
        whileTap={{ scale: 0.98 }}
        onClick={() => store.addSkillB()}
        className="h-full min-h-[320px] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-4 cursor-pointer w-full group relative overflow-hidden transition-all duration-200"
        style={{ 
          borderColor: 'var(--border)',
          background: 'linear-gradient(135deg, var(--surface) 0%, var(--surface-elevated) 100%)'
        }}
      >
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ 
            background: 'radial-gradient(circle at center, var(--output-a) 0%, transparent 70%)',
            opacity: 0.05 
          }}
        />
        <motion.div 
          className="w-16 h-16 rounded-2xl flex items-center justify-center relative z-10"
          style={{ 
            background: 'linear-gradient(135deg, var(--output-a) 0%, var(--output-b) 100%)',
            boxShadow: '0 4px 20px rgba(90, 138, 180, 0.3)'
          }}
          whileHover={{ scale: 1.1, rotate: 90 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <span className="text-2xl text-white font-light">+</span>
        </motion.div>
        <div className="relative z-10 text-center">
          <p className="text-base font-medium text-text-primary mb-1">Add SKILL B</p>
          <p className="text-sm text-text-secondary">Compare two skills side by side</p>
        </div>
        <div className="absolute bottom-4 left-0 right-0 flex justify-center">
          <div className="px-3 py-1 rounded-full text-xs text-text-secondary" style={{ background: 'var(--surface-elevated)' }}>
            Click to add comparison
          </div>
        </div>
      </motion.button>
    )
  }

  if (!skill) return null

  const handleFileLoad = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        setContent(content)
        setValue('content', content, { shouldValidate: true })
      }
      reader.readAsText(file)
    }
    e.target.value = ''
  }

  const handleUseDefault = () => {
    setContent(skill?.content || '')
    setValue('content', skill?.content || '', { shouldValidate: true })
  }

  const borderColor = id === 'a' ? 'var(--output-a)' : 'var(--output-b)'
  const badgeColor = id === 'a' 
    ? 'bg-output-a/20 text-output-a border border-output-a/30' 
    : 'bg-output-b/20 text-output-b border border-output-b/30'
  const accentColor = id === 'a' ? 'focus-visible:ring-output-a' : 'focus-visible:ring-output-b'
  const gradientStart = id === 'a' ? 'var(--output-a)' : 'var(--output-b)'
  const gradientEnd = id === 'a' ? '#7aa5c9' : '#d4a5d6'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ staggerChildren: 0.1, delayChildren: 0.1 }}
    >
      <Card className={cn(
        'rounded-2xl overflow-hidden relative',
        !isValidLength && contentValue.length > 0 ? 'border-destructive/50' : ''
      )}
      style={{ 
        background: 'linear-gradient(180deg, var(--surface) 0%, var(--surface-elevated) 100%)',
        borderLeft: `4px solid ${borderColor}`,
        boxShadow: `0 4px 24px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.03)`
      }}>
        <div 
          className="absolute top-0 left-0 right-0 h-1 opacity-80"
          style={{ 
            background: `linear-gradient(90deg, ${gradientStart}, ${gradientEnd})`
          }}
        />
        <CardHeader className="pb-4 space-y-1 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <motion.span
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                className={cn(
                  'px-3 py-1 text-xs font-bold rounded-lg',
                  badgeColor
                )}
                style={{ backdropFilter: 'blur(8px)' }}
              >
                SKILL {id.toUpperCase()}
              </motion.span>
              {id === 'b' && (
                <motion.button
                  whileHover={{ scale: 1.15, rotate: 90, backgroundColor: 'var(--destructive)' }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => store.removeSkillB()}
                  className="p-1.5 rounded-lg text-text-secondary hover:text-white transition-all duration-200"
                  title="Remove SKILL B"
                  style={{ backgroundColor: 'transparent' }}
                >
                  <X className="w-4 h-4" />
                </motion.button>
              )}
            </div>

            {id === 'b' && store.skillB && store.skillA && (
              <motion.button
                whileHover={{ scale: 1.15, rotate: 180 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => store.swapSkills()}
                className="p-1.5 rounded-lg text-text-secondary hover:text-accent transition-all duration-200"
                title="Swap SKILL A and B"
                style={{ backgroundColor: 'transparent' }}
              >
                <ArrowLeftRight className="w-4 h-4" />
              </motion.button>
            )}
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05, ease: 'easeOut' }}
          >
            <CardDescription className="text-xs text-text-secondary/70">
              Define the transformation rules for {id === 'a' ? 'output A' : 'output B'}
            </CardDescription>
          </motion.div>
        </CardHeader>

        <CardContent className="space-y-4 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
            className="space-y-2"
          >
            <Input
              type="text"
              {...register('name', { required: 'Name is required' })}
              onChange={(e) => {
                setName(e.target.value)
                register('name').onChange(e)
              }}
              className={cn(
                errors.name && 'border-destructive focus-visible:ring-destructive',
                'bg-surface-elevated/50 border-border/50 focus:border-accent transition-all duration-200'
              )}
              placeholder="Skill name..."
            />
            <AnimatePresence>
              {errors.name && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-1.5 text-xs text-destructive"
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.name.message}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15, ease: 'easeOut' }}
            className="space-y-2"
          >
            <div className="relative">
              <Textarea
                {...register('content', { 
                  required: 'Content is required',
                  minLength: { value: 50, message: 'Content must be at least 50 characters' },
                  maxLength: { value: 10000, message: 'Content must be less than 10000 characters' }
                })}
                onChange={(e) => {
                  setContent(e.target.value)
                  register('content').onChange(e)
                }}
                className={cn(
                  'h-64 resize-none font-mono text-xs bg-surface-elevated/30 border-border/50',
                  accentColor,
                  errors.content && 'border-destructive focus-visible:ring-destructive',
                  'transition-all duration-200'
                )}
                placeholder="Paste SKILL.md content here or load from file..."
              />

              <motion.div 
                className={cn(
                  'absolute bottom-3 right-3 text-xs flex items-center gap-1.5 px-2 py-1 rounded-md',
                  contentValue.length > 9500 ? 'text-destructive bg-destructive/10' : 'text-muted-foreground bg-surface-elevated/50'
                )}
                animate={{ opacity: contentValue.length > 0 ? 1 : 0 }}
                style={{ backdropFilter: 'blur(4px)' }}
              >
                {contentValue.length > 9500 && <AlertCircle className="w-3 h-3" />}
                <span className="font-mono">{contentValue.length.toLocaleString()}/10000</span>
              </motion.div>
            </div>

            <AnimatePresence>
              {errors.content && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-1.5 text-xs text-destructive"
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.content.message}
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {isTooShort && !errors.content && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-1.5 text-xs text-yellow-500"
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  Content seems short — may need more detail
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2, ease: 'easeOut' }}
            className="flex items-center gap-2 flex-wrap pt-2"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".md,.txt"
              className="hidden"
              onChange={handleFileLoad}
            />

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="gap-2 hover:bg-surface-elevated/50 transition-all duration-200"
              >
                <Upload className="w-4 h-4" />
                Load File
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleUseDefault}
                className="gap-2 hover:bg-surface-elevated/50 transition-all duration-200"
              >
                <FileText className="w-4 h-4" />
                Use Default
              </Button>
            </motion.div>

            <AnimatePresence>
              {contentValue.length > 0 && (
                <motion.span
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className="ml-auto text-xs text-text-secondary px-2 py-1 rounded-md"
                  style={{ backgroundColor: 'var(--surface-elevated)' }}
                >
                  {contentValue.length.toLocaleString()} chars
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
