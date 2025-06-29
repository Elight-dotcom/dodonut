/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./public/views/**/*.{ejs,html}",
    "./public/**/*.js"
  ],
  theme: {
    extend: {
      colors: {
        dark: '#c95f00',
        primary: '#FF7E26',
        secondary: '#ffb9a2',
        dull: '#ffede8'
      },
      keyframes: {
            fadeIn: {
              '0%': { opacity: '0' },
              '100%': { opacity: '1' }
            },
            slideUp: {
              '0%': { transform: 'translateY(20px)', opacity: '0' },
              '100%': { transform: 'translateY(0)', opacity: '1' }
            },
            float: {
              '0%, 100%': { transform: 'translateY(0px)' },
              '50%': { transform: 'translateY(-10px)' }
            }
          }
    },
  },
  plugins: [],
  darkMode: 'class',
}

