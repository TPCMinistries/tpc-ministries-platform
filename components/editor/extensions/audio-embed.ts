import { Node, mergeAttributes } from '@tiptap/core'

export interface AudioEmbedOptions {
  HTMLAttributes: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    audioEmbed: {
      setAudioEmbed: (options: { src: string }) => ReturnType
    }
  }
}

export const AudioEmbed = Node.create<AudioEmbedOptions>({
  name: 'audioEmbed',

  group: 'block',

  atom: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  addAttributes() {
    return {
      src: {
        default: null,
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-audio-embed]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, { 'data-audio-embed': '' , class: 'audio-embed' }),
      [
        'audio',
        mergeAttributes(HTMLAttributes, { controls: 'true', preload: 'metadata', class: 'w-full' }),
        ['source', { src: HTMLAttributes.src, type: 'audio/mpeg' }],
      ],
    ]
  },

  addCommands() {
    return {
      setAudioEmbed:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          })
        },
    }
  },
})
