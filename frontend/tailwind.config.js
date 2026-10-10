export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bgMain: '#FAF7F2',
        surface: '#FFFFFF',
        softSurface: '#F6F4EF',
        terracotta: {
          DEFAULT: '#BD715C',
          hover: '#A85F4D',
          soft: '#F3DED6'
        },
        sage: {
          DEFAULT: '#7D9588',
          hover: '#6C8376',
          soft: '#E6EEE8'
        },
        mint: {
          DEFAULT: '#79D6B2',
          soft: '#E8F6F0'
        },
        primary: {
          DEFAULT: '#BD715C',
          hover: '#A85F4D',
          soft: '#F3DED6'
        },
        secondary: {
          DEFAULT: '#7D9588',
          hover: '#6C8376',
          soft: '#E6EEE8'
        },
        'primary-hover': '#A85F4D',
        'soft-terracotta': '#F3DED6',
        'soft-sage': '#E6EEE8',
        textPrimary: '#292B29',
        textSecondary: '#626760',
        borderColor: '#E6DED6',
        success: '#6F987C',
        info: '#7196A3',
        'soft-info': '#EAF2F4',

        // Backward compatibility mappings
        'primary-dark': '#292B29',
        'accent-green': '#7D9588',
        'light-mint': '#E6EEE8',
        cream: '#FAF7F2',
        accent: '#BD715C',
        muted: '#626760'
      },
      boxShadow: {
        card: '0 1px 4px 0 rgba(41, 43, 41, 0.04), 0 1px 2px -1px rgba(41, 43, 41, 0.04)',
        elevated: '0 10px 25px -5px rgba(41, 43, 41, 0.07), 0 8px 10px -6px rgba(41, 43, 41, 0.03)',
        soft: '0 4px 20px 0 rgba(41, 43, 41, 0.04)',
        glow: '0 0 15px rgba(189, 113, 92, 0.18)'
      },
      fontFamily: {
        sans: ['Inter', 'Manrope', 'ui-sans-serif', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
};
