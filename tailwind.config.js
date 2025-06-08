/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        // Dark theme backgrounds
        'dark-primary': '#0A0A0A',
        'dark-secondary': '#1A1A1A',
        'dark-tertiary': '#2A2A2A',
        
        // Accent colors
        'accent-primary': '#007AFF',
        'accent-secondary': '#0066E6',
        'accent-tertiary': '#004DB3',
        
        // Text colors
        'text-primary': '#FFFFFF',
        'text-secondary': '#E0E0E0',
        'text-tertiary': '#C0C0C0',
        'text-quaternary': '#999999',
        
        // Interactive states
        'glow-soft': 'rgba(0, 122, 255, 0.2)',
        'glow-medium': 'rgba(0, 122, 255, 0.4)',
        'glow-strong': 'rgba(0, 122, 255, 0.6)',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        'mono': ['SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'monospace'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1.1' }],
        '6xl': ['3.75rem', { lineHeight: '1.1' }],
        '7xl': ['4.5rem', { lineHeight: '1.1' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '26': '6.5rem',
        '30': '7.5rem',
        '34': '8.5rem',
      },
      boxShadow: {
        'glow-sm': '0 0 10px rgba(0, 122, 255, 0.3)',
        'glow-md': '0 0 20px rgba(0, 122, 255, 0.4)',
        'glow-lg': '0 0 30px rgba(0, 122, 255, 0.5)',
        'inner-glow': 'inset 0 0 20px rgba(0, 122, 255, 0.2)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'gradient-shift': 'gradient-shift 8s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { 
            boxShadow: '0 0 20px rgba(0, 122, 255, 0.3)',
            borderColor: 'rgba(0, 122, 255, 0.3)'
          },
          '50%': { 
            boxShadow: '0 0 30px rgba(0, 122, 255, 0.6)',
            borderColor: 'rgba(0, 122, 255, 0.6)'
          },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
    },
  },
  plugins: [],
}; 