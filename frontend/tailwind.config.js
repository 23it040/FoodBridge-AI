export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'primary-dark': '#1A312C',
        primary: '#428475',
        mint: '#89D7B7',
        cream: '#FFF4E1',
        secondary: '#428475',
        accent: '#89D7B7',
        surface: '#FFF4E1',
        muted: '#64748B'
      },
      boxShadow: {
        card: '0 4px 20px -2px rgba(26, 49, 44, 0.06), 0 2px 6px -1px rgba(26, 49, 44, 0.04)',
        elevated: '0 12px 32px -4px rgba(26, 49, 44, 0.12), 0 4px 12px -2px rgba(26, 49, 44, 0.06)'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
};
