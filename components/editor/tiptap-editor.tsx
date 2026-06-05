'use client'

import { useEditor, EditorContent, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TiptapImage from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Youtube from '@tiptap/extension-youtube'
import Placeholder from '@tiptap/extension-placeholder'
import UnderlineExtension from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import EditorToolbar from './editor-toolbar'
import { AudioEmbed } from './extensions/audio-embed'
import { VideoEmbed } from './extensions/video-embed'
import './editor-styles.css'

interface TiptapEditorProps {
  content: string
  onChange: (html: string) => void
  placeholder?: string
  onImageClick?: () => void
  onAudioClick?: () => void
  onVideoClick?: () => void
  className?: string
}

export default function TiptapEditor({
  content,
  onChange,
  placeholder = 'Start writing...',
  onImageClick,
  onAudioClick,
  onVideoClick,
  className = '',
}: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      TiptapImage.configure({
        HTMLAttributes: { class: 'rounded-lg max-w-full' },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-blue-600 underline' },
      }),
      Youtube.configure({
        width: 640,
        height: 360,
        HTMLAttributes: { class: 'rounded-lg' },
      }),
      Placeholder.configure({ placeholder }),
      UnderlineExtension,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      AudioEmbed,
      VideoEmbed,
    ],
    content,
    editorProps: {
      attributes: {
        class: 'outline-none',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  if (!editor) return null

  return (
    <div className={`tiptap-editor ${className}`}>
      <EditorToolbar
        editor={editor}
        onImageClick={onImageClick}
        onAudioClick={onAudioClick}
        onVideoClick={onVideoClick}
      />
      <EditorContent editor={editor} />
    </div>
  )
}

// Helper to insert media into the editor from external picker
type MediaEditor = Editor & {
  commands: Editor['commands'] & {
    setAudioEmbed: (attrs: { src: string }) => boolean
    setVideoEmbed: (attrs: { src: string }) => boolean
  }
}

export function insertImageIntoEditor(editor: Editor | null, url: string, alt?: string) {
  editor?.chain().focus().setImage({ src: url, alt: alt || '' }).run()
}

export function insertAudioIntoEditor(editor: MediaEditor | null, url: string) {
  editor?.commands.setAudioEmbed({ src: url })
}

export function insertVideoIntoEditor(editor: MediaEditor | null, url: string) {
  editor?.commands.setVideoEmbed({ src: url })
}
