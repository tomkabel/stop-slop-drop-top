'use client'

import { useStore } from '@/lib/store'
import { PROVIDERS, getModelsForProvider, ProviderType } from '@/lib/llm-providers'
import { ChevronDown, Key, Loader2, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export function ProviderSelector() {
  const provider = useStore(state => state.provider)
  const modelId = useStore(state => state.modelId)
  const modelStatus = useStore(state => state.modelStatus)
  const apiKeys = useStore(state => state.apiKeys)
  const showApiKeys = useStore(state => state.showApiKeys)
  const setProvider = useStore(state => state.setProvider)
  const setModelId = useStore(state => state.setModelId)
  const setApiKey = useStore(state => state.setApiKey)
  const setShowApiKeys = useStore(state => state.setShowApiKeys)
  const loadModel = useStore(state => state.loadModel)

  const currentProvider = PROVIDERS[provider]
  const models = getModelsForProvider(provider)
  const currentModel = models.find(m => m.id === modelId)

  useEffect(() => {
    if (provider === 'webllm') {
      loadModel()
    } else if (apiKeys[provider]) {
      setProvider(provider)
    }
  }, [provider, apiKeys, loadModel, setProvider])

  const needsApiKey = currentProvider?.requiresApiKey
  const hasApiKey = provider !== 'webllm' && !!apiKeys[provider]
  const isReady = modelStatus === 'ready'
  const isLoading = ['checking', 'downloading', 'loading'].includes(modelStatus)

  const statusColors = {
    idle: 'bg-gray-500',
    checking: 'bg-blue-500 animate-pulse',
    downloading: 'bg-blue-500 animate-pulse',
    loading: 'bg-yellow-500 animate-pulse',
    ready: 'bg-green-500',
    error: 'bg-red-500',
  }

  return (
    <div className="flex items-center gap-2">
      <AnimatePresence>
        {needsApiKey && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            <Button
              variant="ghost"
              size="icon"
              aria-label={hasApiKey ? 'API Key configured' : 'API Key required'}
              onClick={() => setShowApiKeys(!showApiKeys)}
              className={cn(
                'p-2 rounded-lg transition-colors',
                hasApiKey
                  ? 'text-green-500 hover:bg-green-500/10'
                  : 'text-yellow-500 hover:bg-yellow-500/10'
              )}
              title={hasApiKey ? 'API Key configured' : 'API Key required'}
            >
              <Key className="w-5 h-5" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <Select
        value={provider}
        onValueChange={(value: string) => setProvider(value as ProviderType)}
      >
        <SelectTrigger className="w-[240px] bg-surface-elevated border-border hover:border-accent transition-colors">
          <SelectValue placeholder="Select provider" />
        </SelectTrigger>
        <SelectContent className="bg-surface border-border">
          {Object.values(PROVIDERS).map((p) => (
            <SelectItem
              key={p.id}
              value={p.id}
              className="focus:bg-surface-hover focus:text-text-primary"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{p.icon}</span>
                <div>
                  <div className="text-sm font-medium">{p.name}</div>
                  <div className="text-xs text-text-secondary">{p.description}</div>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={modelId}
        onValueChange={(value: string) => setModelId(value)}
        disabled={!hasApiKey && needsApiKey}
      >
        <SelectTrigger
          className={cn(
            'w-[320px] bg-surface-elevated border-border transition-colors',
            hasApiKey || !needsApiKey
              ? 'hover:border-accent cursor-pointer'
              : 'opacity-50 cursor-not-allowed'
          )}
        >
          <div className="flex items-center gap-2">
            {isLoading && <Loader2 className="w-4 h-4 animate-spin text-accent" />}
            <span className={cn('w-2 h-2 rounded-full', statusColors[modelStatus])} />
            <SelectValue placeholder="Select model" />
          </div>
        </SelectTrigger>
        <SelectContent className="bg-surface border-border max-h-80">
          {models.map((m) => (
            <SelectItem
              key={m.id}
              value={m.id}
              className="focus:bg-surface-hover focus:text-text-primary"
            >
              <div>
                <div className="text-sm font-medium">{m.name}</div>
                <div className="text-xs text-text-secondary">{m.description}</div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <ApiKeyModal
        open={showApiKeys}
        provider={provider}
        apiKey={apiKeys[provider]}
        onSetKey={(key) => setApiKey(provider, key)}
        onClose={() => setShowApiKeys(false)}
      />
    </div>
  )
}

interface ApiKeyModalProps {
  open: boolean
  provider: ProviderType
  apiKey: string
  onSetKey: (key: string) => void
  onClose: () => void
}

function ApiKeyModal({ open, provider, apiKey, onSetKey, onClose }: ApiKeyModalProps) {
  const [key, setKey] = useState(apiKey)
  const [showKey, setShowKey] = useState(false)
  const p = PROVIDERS[provider]

  useEffect(() => {
    setKey(apiKey)
  }, [apiKey])

  const handleSave = () => {
    onSetKey(key.trim())
    onClose()
  }

  const getPlaceholder = () => {
    switch (provider) {
      case 'openai':
        return 'sk-...'
      case 'claude':
        return 'sk-ant-...'
      case 'gemini':
        return 'AIza...'
      case 'openrouter':
        return 'sk-or-...'
      default:
        return ''
    }
  }

  const getLink = () => {
    switch (provider) {
      case 'openai':
        return 'https://platform.openai.com/api-keys'
      case 'claude':
        return 'https://console.anthropic.com/settings/keys'
      case 'gemini':
        return 'https://aistudio.google.com/app/apikey'
      case 'openrouter':
        return 'https://openrouter.ai/keys'
      default:
        return ''
    }
  }

  return (
      <Dialog open={open} onOpenChange={(isOpen: boolean) => !isOpen && onClose()}>
      <DialogContent className="bg-surface border-border max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{p.icon}</span>
            <DialogTitle className="text-lg font-semibold text-text-primary">
              Configure {p.name}
            </DialogTitle>
          </div>
          <DialogDescription className="text-text-secondary">
            Enter your {p.name} API key to use {p.name} models. Your key is stored locally in your browser and never sent to our servers.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              API Key
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder={getPlaceholder()}
                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-text-primary placeholder:text-text-secondary/50 focus:ring-2 focus:ring-accent focus:border-accent pr-12"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
              >
                {showKey ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <a
            href={getLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-accent hover:underline"
          >
            Get your {p.name} API key →
          </a>
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!key.trim()}
            className="bg-accent hover:bg-accent-hover text-background"
          >
            Save API Key
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}