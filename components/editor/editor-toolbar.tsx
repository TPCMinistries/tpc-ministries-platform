'use client'

import { Editor } from '@tiptap/react'
import { Button } from '@/components/ui/button'
import {
  Bold, Italic, Underline, Strikethrough,
  Heading1, Heading2, Heading3,
  List, ListOrdered, Quote,
  AlignLeft, AlignCenter, AlignRight,
  Link2, ImageIcon, Youtube, Music,
  Video, Undo2, Redo2,
  Minus,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCallback } from 'react'

interface EditorToolbarProps {
  editor: Editor
  onImageClick?: () => void
  onAudioClick?: () => void
  onVideoClick?: () => void
}

function ToolbarButton({
  onClick,
  isActive = false,
  disabled = false,
  children,
  title,
}: {
  onClick: () => void
  isActive?: boolean
  disabled?: boolean
  children: React.ReactNode
  title: string
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={cn(
        'h-8 w-8 p-0',
        isActive && 'bg-gray-200 text-navy'
      )}
      onClick={onClick}
      disabled={disabled}
      title={title}
    >
      {children}
    </Button>
  )
}

function ToolbarDivider() {
  return <div className="w-px h-6 bg-gray-200 mx-1" />
}

export default function EditorToolbar({ editor, onImageClick, onAudioClick, onVideoClick }: EditorToolbarProps) {
  const setLink = useCallback(() => {
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('URL', previousUrl)

    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }, [editor])

  const addYoutubeVideo = useCallback(() => {
    const url = window.prompt('YouTube URL')
    if (!url) return
    editor.commands.setYoutubeVideo({ src: url })
  }, [editor])

  const addImage = useCallback(() => {
    if (onImageClick) {
      onImageClick()
      return
    }
    const url = window.prompt('Image URL')
    if (!url) return
    editor.chain().focus().setImage({ src: url }).run()
  }, [editor, onImageClick])

  const addAudio = useCallback(() => {
    if (onAudioClick) {
      onAudioClick()
      return
    }
    const url = window.prompt('Audio URL')
    if (!url) return
    editor.commands.setAudioEmbed({ src: url })
  }, [editor, onAudioClick])

  const addVideo = useCallback(() => {
    if (onVideoClick) {
      onVideoClick()
      return
    }
    const url = window.prompt('Video URL')
    if (!url) return
    editor.commands.setVideoEmbed({ src: url })
  }, [editor, onVideoClick])

  return (
    <div className="flex flex-wrap items-center gap-0.5 p-2 border-b bg-gray-50">
      {/* Undo / Redo */}
      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="Undo"
      >
        <Undo2 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="Redo"
      >
        <Redo2 className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Headings */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        isActive={editor.isActive('heading', { level: 1 })}
        title="Heading 1"
      >
        <Heading1 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={editor.isActive('heading', { level: 2 })}
        title="Heading 2"
      >
        <Heading2 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        isActive={editor.isActive('heading', { level: 3 })}
        title="Heading 3"
      >
        <Heading3 className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Text formatting */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive('bold')}
        title="Bold"
      >
        <Bold className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive('italic')}
        title="Italic"
      >
        <Italic className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        isActive={editor.isActive('underline')}
        title="Underline"
      >
        <Underline className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Lists & Quote */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive('bulletList')}
        title="Bullet List"
      >
        <List className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive('orderedList')}
        title="Numbered List"
      >
        <ListOrdered className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={editor.isActive('blockquote')}
        title="Blockquote"
      >
        <Quote className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        title="Horizontal Rule"
      >
        <Minus className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Alignment */}
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        isActive={editor.isActive({ textAlign: 'left' })}
        title="Align Left"
      >
        <AlignLeft className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        isActive={editor.isActive({ textAlign: 'center' })}
        title="Align Center"
      >
        <AlignCenter className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        isActive={editor.isActive({ textAlign: 'right' })}
        title="Align Right"
      >
        <AlignRight className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Media */}
      <ToolbarButton
        onClick={setLink}
        isActive={editor.isActive('link')}
        title="Insert Link"
      >
        <Link2 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton onClick={addImage} title="Insert Image">
        <ImageIcon className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton onClick={addYoutubeVideo} title="Insert YouTube Video">
        <Youtube className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton onClick={addAudio} title="Insert Audio">
        <Music className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton onClick={addVideo} title="Insert Video">
        <Video className="h-4 w-4" />
      </ToolbarButton>
    </div>
  )
}
