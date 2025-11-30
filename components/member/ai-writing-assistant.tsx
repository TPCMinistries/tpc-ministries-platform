'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Sparkles,
  Wand2,
  RefreshCw,
  Copy,
  Check,
  Loader2,
  ChevronDown,
  ChevronUp,
  BookOpen,
  HandHeart,
  Heart,
  Pencil,
  MessageCircle
} from 'lucide-react'

type AssistantMode = 'prayer' | 'reflection' | 'gratitude' | 'testimony' | 'general'

interface AIWritingAssistantProps {
  mode?: AssistantMode
  initialContent?: string
  onInsert?: (text: string) => void
  placeholder?: string
  className?: string
}

const MODE_CONFIG = {
  prayer: {
    label: 'Prayer',
    icon: HandHeart,
    color: 'bg-purple-500',
    placeholder: 'What would you like to pray about?',
    suggestions: [
      'Help me pray for guidance',
      'A prayer of thanksgiving',
      'Intercession for a loved one',
      'Prayer for healing',
      'Surrendering my worries'
    ]
  },
  reflection: {
    label: 'Reflection',
    icon: BookOpen,
    color: 'bg-blue-500',
    placeholder: 'What are you reflecting on today?',
    suggestions: [
      'A scripture that spoke to me',
      'What God is teaching me',
      'Processing a challenge',
      'A moment of peace',
      'My spiritual growth'
    ]
  },
  gratitude: {
    label: 'Gratitude',
    icon: Heart,
    color: 'bg-pink-500',
    placeholder: 'What are you grateful for?',
    suggestions: [
      'Blessings in my life',
      "God's provision",
      'Family and relationships',
      'Answered prayers',
      'Small daily mercies'
    ]
  },
  testimony: {
    label: 'Testimony',
    icon: MessageCircle,
    color: 'bg-green-500',
    placeholder: 'Share your testimony...',
    suggestions: [
      'How God saved me',
      'A miracle in my life',
      'My journey of faith',
      'Overcoming through Christ',
      'God\'s faithfulness'
    ]
  },
  general: {
    label: 'Writing',
    icon: Pencil,
    color: 'bg-gray-500',
    placeholder: 'What would you like help writing?',
    suggestions: [
      'Help me express my thoughts',
      'Make this more eloquent',
      'Expand on this idea',
      'Add scripture references',
      'Polish my writing'
    ]
  }
}

export default function AIWritingAssistant({
  mode = 'general',
  initialContent = '',
  onInsert,
  placeholder,
  className = ''
}: AIWritingAssistantProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [input, setInput] = useState(initialContent)
  const [output, setOutput] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState(false)
  const [currentMode, setCurrentMode] = useState<AssistantMode>(mode)

  const config = MODE_CONFIG[currentMode]

  const generateContent = async (customPrompt?: string) => {
    const prompt = customPrompt || input
    if (!prompt.trim()) return

    setIsGenerating(true)
    try {
      let endpoint = '/api/ai/prayer-helper'
      let body: any = { context: prompt }

      if (currentMode === 'prayer') {
        body.type = 'petition'
      } else if (currentMode === 'gratitude') {
        body.type = 'gratitude'
        endpoint = '/api/ai/prayer-helper'
      } else {
        // Use insights API for non-prayer content
        endpoint = '/api/ai/insights'
        body = { content: prompt }
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        const data = await res.json()
        if (currentMode === 'prayer' || currentMode === 'gratitude') {
          setOutput(data.prayer || '')
        } else {
          // Format insights as helpful text
          const insights = data.insights
          let formatted = ''
          if (insights?.summary) {
            formatted += insights.summary + '\n\n'
          }
          if (insights?.reflectionPrompts?.length > 0) {
            formatted += 'Reflection prompts:\n'
            insights.reflectionPrompts.forEach((p: string) => {
              formatted += `• ${p}\n`
            })
            formatted += '\n'
          }
          if (insights?.scriptures?.length > 0) {
            formatted += 'Related scriptures: ' + insights.scriptures.join(', ')
          }
          setOutput(formatted.trim() || 'Unable to generate suggestions.')
        }
      } else {
        setOutput('Failed to generate content. Please try again.')
      }
    } catch (error) {
      console.error('Error generating content:', error)
      setOutput('An error occurred. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = async () => {
    if (output) {
      await navigator.clipboard.writeText(output)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleInsert = () => {
    if (output && onInsert) {
      onInsert(output)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion)
    generateContent(suggestion)
  }

  if (!isExpanded) {
    return (
      <Button
        variant="outline"
        onClick={() => setIsExpanded(true)}
        className={`gap-2 ${className}`}
      >
        <Sparkles className="h-4 w-4 text-purple-500" />
        AI Writing Assistant
        <ChevronDown className="h-4 w-4" />
      </Button>
    )
  }

  return (
    <Card className={`border-purple-200 dark:border-purple-800 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            AI Writing Assistant
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(false)}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>
          Let AI help you express your thoughts, prayers, and reflections
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Mode Selection */}
        <div className="flex flex-wrap gap-2">
          {(Object.keys(MODE_CONFIG) as AssistantMode[]).map((m) => {
            const cfg = MODE_CONFIG[m]
            const Icon = cfg.icon
            return (
              <Button
                key={m}
                variant={currentMode === m ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentMode(m)}
                className="gap-1"
              >
                <Icon className="h-3 w-3" />
                {cfg.label}
              </Button>
            )
          })}
        </div>

        {/* Quick Suggestions */}
        <div>
          <p className="text-xs text-muted-foreground mb-2">Quick prompts:</p>
          <div className="flex flex-wrap gap-1">
            {config.suggestions.map((suggestion, i) => (
              <Badge
                key={i}
                variant="secondary"
                className="cursor-pointer hover:bg-primary/20 transition-colors"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion}
              </Badge>
            ))}
          </div>
        </div>

        {/* Input */}
        <Textarea
          placeholder={placeholder || config.placeholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={3}
          className="resize-none"
        />

        {/* Generate Button */}
        <Button
          onClick={() => generateContent()}
          disabled={isGenerating || !input.trim()}
          className="w-full gap-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Wand2 className="h-4 w-4" />
              Generate
            </>
          )}
        </Button>

        {/* Output */}
        {output && (
          <div className="space-y-2">
            <div className="bg-muted rounded-lg p-3">
              <p className="text-sm whitespace-pre-wrap">{output}</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
                className="gap-1"
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    Copy
                  </>
                )}
              </Button>
              {onInsert && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleInsert}
                  className="gap-1"
                >
                  <Pencil className="h-3 w-3" />
                  Insert into Entry
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => generateContent()}
                disabled={isGenerating}
                className="gap-1"
              >
                <RefreshCw className={`h-3 w-3 ${isGenerating ? 'animate-spin' : ''}`} />
                Regenerate
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
