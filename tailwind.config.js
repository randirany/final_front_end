/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: "class",
  theme: {
    extend: {
      screens: {
        '2sm': '750px',
        '2md': '986px',
        '3sm': '450px',
      },
       animation: {
        'scale-in': 'scale-in 0.2s ease-out forwards',
      },
      keyframes: {
        'scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      colors: {


        graySpan: '#6B7280',
        redPoint: '#f5f5f5',
        secnodColor: '#C3CEF6',
        // dark2: 'rgb(42, 42, 42)',
        dark2:'rgb(17, 24, 39)',
        // navbarBack: 'rgb(31, 31, 31)',
        navbarBack:'#1F2937',
        nav: 'rgb(30, 41, 59) ',
        dark4: 'rgb(51, 65, 85)',
        textNav: 'rgb(226, 232, 240)',
        dark3: 'rgb(148, 163, 184)',
        borderNav: 'rgb(51, 65, 85) ',
        darkBorder: 'rgb(71, 85, 105)'
      }
    },
  },
  plugins: [],
}
