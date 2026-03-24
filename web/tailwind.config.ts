import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#080808',
        surface: '#121212',
        'surface-elevated': '#161616',
        'surface-hover': '#1a1a1a',
        border: '#242424',
        'border-accent': '#333333',
        'text-primary': '#f5f5f5',
        'text-secondary': '#888888',
        'text-muted': '#555555',
        accent: {
          DEFAULT: '#c9a66b',
          hover: '#d4b67a',
          muted: 'rgba(201, 166, 107, 0.15)',
        },
        success: '#6ba36b',
        warning: '#d4b94a',
        danger: '#c45a5a',
        'output-a': '#5a8ab4',
        'output-b': '#b47dbf',
      },
      fontFamily: {
        sans: ['Source Sans 3', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'monospace'],
      },
      fontSize: {
        'display': ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.03em' }],
        'heading': ['2rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        'subheading': ['1.25rem', { lineHeight: '1.4' }],
      },
      boxShadow: {
        'glow': '0 0 20px -5px var(--accent-muted)',
        'glow-lg': '0 0 40px -10px var(--accent-muted)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
        'fade-in-down': 'fadeInDown 0.5s ease-out forwards',
        'slide-in-right': 'slideInRight 0.4s ease-out forwards',
        'slide-in-left': 'slideInLeft 0.4s ease-out forwards',
        'scale-in': 'scaleIn 0.3s ease-out forwards',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 3s ease-in-out infinite',
        'glow': 'pulse-glow 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
export default config
