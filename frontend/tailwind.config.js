/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#070b14',
          2: '#0d1422',
          3: '#111827',
          4: '#1a2235',
        },
        neon: {
          blue:   '#00d4ff',
          purple: '#7c3aed',
          green:  '#10b981',
          amber:  '#f59e0b',
          pink:   '#ec4899',
        },
        border: {
          DEFAULT: '#1e2d3d',
          bright:  '#2d4a6a',
        },
        muted: '#64748b',
      },
      fontFamily: {
        mono:  ['"Space Mono"', 'monospace'],
        sans:  ['Syne', 'system-ui', 'sans-serif'],
        display: ['Syne', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow':       'glow 2s ease-in-out infinite alternate',
        'scan':       'scan 4s linear infinite',
        'float':      'float 6s ease-in-out infinite',
        'fade-in':    'fadeIn 0.3s ease-out forwards',
        'slide-up':   'slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'slide-right':'slideRight 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards',
      },
      keyframes: {
        glow: {
          '0%':   { boxShadow: '0 0 5px #00d4ff44, 0 0 10px #00d4ff22' },
          '100%': { boxShadow: '0 0 10px #00d4ff88, 0 0 30px #00d4ff44' },
        },
        scan: {
          '0%':   { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        slideRight: {
          from: { opacity: '0', transform: 'translateX(16px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
      },
      backdropBlur: { xs: '2px' },
      boxShadow: {
        neon:       '0 0 20px rgba(0, 212, 255, 0.3)',
        'neon-sm':  '0 0 8px rgba(0, 212, 255, 0.25)',
        'neon-purple': '0 0 20px rgba(124, 58, 237, 0.4)',
        panel:      '0 4px 24px rgba(0, 0, 0, 0.6)',
      },
    },
  },
  plugins: [],
};
