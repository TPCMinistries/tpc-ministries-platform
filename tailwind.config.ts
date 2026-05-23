import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			// TPC Brand Colors — Single source of truth
  			'tpc-navy': '#1e3a61',
  			'tpc-gold': '#d4b883',
  			'tpc-gold-accent': '#daa520',
  			'tpc-beige': '#f5f1e8',
  			'tpc-beige-dark': '#e8dfc9',
  			// Unified navy scale (single definition, no conflicts)
  			navy: {
  				DEFAULT: '#1e3a61',
  				50: '#f0f4fb',
  				100: '#dce5f3',
  				200: '#bccde8',
  				300: '#8daad7',
  				400: '#5c84c2',
  				500: '#3b65ab',
  				600: '#2c4f90',
  				700: '#1e3a61',
  				800: '#1a3054',
  				900: '#162847',
  				950: '#0e1a2e',
  			},
  			// Unified gold scale
  			gold: {
  				DEFAULT: '#d4b883',
  				50: '#fdf9f0',
  				100: '#f9f0db',
  				200: '#f2ddb5',
  				300: '#e9c68a',
  				400: '#d4b883',
  				500: '#c9a256',
  				600: '#b8923e',
  				700: '#9a7733',
  				800: '#7d612e',
  				900: '#675028',
  				950: '#3a2b13',
  				text: '#b89740', // WCAG AA-safe gold for text on white
  			},
  			cream: '#FAF5EB',
  			// Semantic colors
  			spiritual: {
  				DEFAULT: 'hsl(var(--spiritual))',
  				foreground: 'hsl(var(--spiritual-foreground))',
  			},
  			success: {
  				DEFAULT: 'hsl(var(--success))',
  				foreground: 'hsl(var(--success-foreground))',
  			},
  			warning: {
  				DEFAULT: 'hsl(var(--warning))',
  				foreground: 'hsl(var(--warning-foreground))',
  			},
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		fontFamily: {
  			sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
  			display: ['var(--font-playfair)', 'Georgia', 'serif'],
  			serif: ['var(--font-playfair)', 'Georgia', 'Cambria', 'Times New Roman', 'serif'],
  			mono: ['var(--font-geist-mono)', 'monospace'],
  		},
  		fontSize: {
  			// Typography scale with tuned line-heights and letter-spacing
  			'display-2xl': ['4.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
  			'display-xl': ['3.75rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
  			'display-lg': ['3rem', { lineHeight: '1.15', letterSpacing: '-0.015em', fontWeight: '700' }],
  			'display-md': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '600' }],
  			'display-sm': ['1.875rem', { lineHeight: '1.25', letterSpacing: '-0.01em', fontWeight: '600' }],
  			'display-xs': ['1.5rem', { lineHeight: '1.3', letterSpacing: '-0.005em', fontWeight: '600' }],
  			'body-xl': ['1.25rem', { lineHeight: '1.6' }],
  			'body-lg': ['1.125rem', { lineHeight: '1.6' }],
  			'body-md': ['1rem', { lineHeight: '1.6' }],
  			'body-sm': ['0.875rem', { lineHeight: '1.5' }],
  			'body-xs': ['0.75rem', { lineHeight: '1.5' }],
  			'caption': ['0.6875rem', { lineHeight: '1.4', letterSpacing: '0.01em' }],
  		},
  		spacing: {
  			'section': '6rem',
  			'section-sm': '4rem',
  			'section-lg': '8rem',
  		},
  		keyframes: {
  			'gold-shimmer': {
  				'0%': { backgroundPosition: '-200% 0' },
  				'100%': { backgroundPosition: '200% 0' },
  			},
  			'fade-in': {
  				from: { opacity: '0', transform: 'translateY(20px)' },
  				to: { opacity: '1', transform: 'translateY(0)' },
  			},
  			'fade-in-up': {
  				from: { opacity: '0', transform: 'translateY(30px)' },
  				to: { opacity: '1', transform: 'translateY(0)' },
  			},
  			'glow-pulse': {
  				'0%, 100%': { boxShadow: '0 0 8px rgba(212, 184, 131, 0.3)' },
  				'50%': { boxShadow: '0 0 20px rgba(212, 184, 131, 0.6)' },
  			},
  			'shake': {
  				'0%, 100%': { transform: 'translateX(0)' },
  				'15%': { transform: 'translateX(-6px)' },
  				'30%': { transform: 'translateX(5px)' },
  				'45%': { transform: 'translateX(-4px)' },
  				'60%': { transform: 'translateX(3px)' },
  				'75%': { transform: 'translateX(-2px)' },
  			},
  		},
  		animation: {
  			'gold-shimmer': 'gold-shimmer 2s linear infinite',
  			'fade-in': 'fade-in 0.6s ease-out',
  			'fade-in-up': 'fade-in-up 0.8s ease-out',
  			'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
  			'shake': 'shake 0.5s ease-in-out',
  		},
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
