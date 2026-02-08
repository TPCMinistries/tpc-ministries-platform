import { Node, mergeAttributes } from '@tiptap/core'

export interface VideoEmbedOptions {
  HTMLAttributes: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    videoEmbed: {
      setVideoEmbed: (options: { src: string }) => ReturnType
    }
  }
}

export const VideoEmbed = Node.create<VideoEmbedOptions>({
  name: 'videoEmbed',

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
        tag: 'div[data-video-embed]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, { 'data-video-embed': '', class: 'video-embed' }),
      [
        'video',
        mergeAttributes(HTMLAttributes, { controls: 'true', preload: 'metadata', class: 'w-full rounded-lg' }),
        ['source', { src: HTMLAttributes.src }],
      ],
    ]
  },

  addCommands() {
    return {
      setVideoEmbed:
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
