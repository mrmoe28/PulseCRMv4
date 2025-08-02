/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // CSS variable based colors for theming
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // Enhanced color palette with semantic naming
        gray: {
          950: '#0a0a0a',
          900: '#111827',
          800: '#1f2937',
          750: '#2d3748',
          700: '#374151',
          650: '#4a5568',
          600: '#4b5563',
          550: '#718096',
          500: '#6b7280',
          450: '#a0aec0',
          400: '#9ca3af',
          350: '#cbd5e0',
          300: '#d1d5db',
          250: '#e2e8f0',
          200: '#e5e7eb',
          150: '#edf2f7',
          100: '#f3f4f6',
          50: '#f9fafb',
        },
        orange: {
          600: '#ea580c',
          500: '#f97316',
          400: '#fb923c',
          300: '#fed7aa',
        },
        blue: {
          700: '#1d4ed8',
          600: '#2563eb',
          500: '#3b82f6',
          400: '#60a5fa',
          300: '#93c5fd',
        },
        // Status colors for better semantic usage
        success: {
          600: '#059669',
          500: '#10b981',
          400: '#34d399',
          300: '#6ee7b7',
        },
        warning: {
          600: '#d97706',
          500: '#f59e0b',
          400: '#fbbf24',
          300: '#fcd34d',
        },
        danger: {
          600: '#dc2626',
          500: '#ef4444',
          400: '#f87171',
          300: '#fca5a5',
        },
      },
      // Custom component utilities
      spacing: {
        18: '4.5rem',
        88: '22rem',
        112: '28rem',
        128: '32rem',
      },
      // Animation improvements
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-in-out',
        'slide-down': 'slideDown 0.3s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      // Typography improvements
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.75rem' }],
      },
      // Box shadows for depth
      boxShadow: {
        soft: '0 2px 4px rgba(0, 0, 0, 0.1)',
        medium: '0 4px 8px rgba(0, 0, 0, 0.12)',
        strong: '0 8px 16px rgba(0, 0, 0, 0.15)',
        'glow-orange': '0 0 20px rgba(249, 115, 22, 0.4)',
        'glow-blue': '0 0 20px rgba(59, 130, 246, 0.4)',
      },
      // Border radius improvements
      borderRadius: {
        xl: '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  // Performance optimizations
  corePlugins: {
    // Disable unused features for better performance
    float: false,
    clear: false,
    skew: false,
  },
  plugins: [
    // Custom plugin for common component patterns
    function ({ addComponents, theme }) {
      addComponents({
        // Card component utility
        '.card': {
          backgroundColor: theme('colors.gray.800'),
          borderColor: theme('colors.gray.700'),
          borderWidth: '1px',
          borderRadius: theme('borderRadius.xl'),
          padding: theme('spacing.6'),
        },
        '.card-header': {
          paddingBottom: theme('spacing.4'),
          borderBottomWidth: '1px',
          borderBottomColor: theme('colors.gray.700'),
          marginBottom: theme('spacing.4'),
        },
        // Button component utilities
        '.btn-primary': {
          backgroundColor: theme('colors.orange.500'),
          color: theme('colors.white'),
          padding: `${theme('spacing.2')} ${theme('spacing.4')}`,
          borderRadius: theme('borderRadius.lg'),
          fontWeight: theme('fontWeight.medium'),
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            backgroundColor: theme('colors.orange.600'),
          },
          '&:disabled': {
            opacity: '0.5',
            cursor: 'not-allowed',
          },
        },
        '.btn-secondary': {
          backgroundColor: theme('colors.gray.600'),
          color: theme('colors.white'),
          padding: `${theme('spacing.2')} ${theme('spacing.4')}`,
          borderRadius: theme('borderRadius.lg'),
          fontWeight: theme('fontWeight.medium'),
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            backgroundColor: theme('colors.gray.500'),
          },
          '&:disabled': {
            opacity: '0.5',
            cursor: 'not-allowed',
          },
        },
        // Form component utilities
        '.form-input': {
          width: '100%',
          padding: `${theme('spacing.2')} ${theme('spacing.4')}`,
          backgroundColor: theme('colors.gray.700'),
          borderColor: theme('colors.gray.600'),
          borderWidth: '1px',
          borderRadius: theme('borderRadius.lg'),
          color: theme('colors.white'),
          fontSize: theme('fontSize.sm'),
          transition: 'all 0.2s ease-in-out',
          '&::placeholder': {
            color: theme('colors.gray.400'),
          },
          '&:focus': {
            outline: 'none',
            borderColor: theme('colors.orange.500'),
            boxShadow: `0 0 0 2px ${theme('colors.orange.500')}40`,
          },
          '&.error': {
            borderColor: theme('colors.danger.500'),
            '&:focus': {
              borderColor: theme('colors.danger.500'),
              boxShadow: `0 0 0 2px ${theme('colors.danger.500')}40`,
            },
          },
        },
        '.form-label': {
          display: 'block',
          fontSize: theme('fontSize.sm'),
          fontWeight: theme('fontWeight.medium'),
          color: theme('colors.gray.300'),
          marginBottom: theme('spacing.2'),
        },
        // Status badge utilities
        '.badge': {
          display: 'inline-flex',
          alignItems: 'center',
          padding: `${theme('spacing.1')} ${theme('spacing.2')}`,
          borderRadius: theme('borderRadius.md'),
          fontSize: theme('fontSize.xs'),
          fontWeight: theme('fontWeight.medium'),
        },
        '.badge-primary': {
          backgroundColor: theme('colors.blue.600'),
          color: theme('colors.white'),
        },
        '.badge-success': {
          backgroundColor: theme('colors.success.600'),
          color: theme('colors.white'),
        },
        '.badge-warning': {
          backgroundColor: theme('colors.warning.600'),
          color: theme('colors.white'),
        },
        '.badge-danger': {
          backgroundColor: theme('colors.danger.600'),
          color: theme('colors.white'),
        },
      });
    },
  ],
};
