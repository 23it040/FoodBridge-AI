export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'primary-dark': '#102A2A',
        primary: '#2F8F72',
        'accent-green': '#79D6B2',
        'light-mint': '#E8F6F0',
        bgMain: '#F6F7F4',
        surface: '#FFFFFF',
        textPrimary: '#17201F',
        textSecondary: '#687370',
        borderColor: '#DDE5E1',
        success: '#2F8F72',
        warning: '#E5A83B',
        danger: '#D95C5C',
        mapAccent: '#5BAA8B',

        // Backward compatibility mappings
        mint: '#79D6B2',
        cream: '#F6F7F4',
        secondary: '#2F8F72',
        accent: '#79D6B2',
        muted: '#687370'
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(16, 42, 42, 0.05), 0 1px 2px -1px rgba(16, 42, 42, 0.05)',
        elevated: '0 10px 25px -5px rgba(16, 42, 42, 0.08), 0 8px 10px -6px rgba(16, 42, 42, 0.04)',
        soft: '0 4px 20px 0 rgba(16, 42, 42, 0.05)',
        glow: '0 0 15px rgba(47, 143, 114, 0.15)'
      },
      fontFamily: {
        sans: ['Inter', 'Manrope', 'ui-sans-serif', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
};
