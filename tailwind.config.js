/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      fontFamily: {
        'mono': ['JetBrains Mono', 'Courier New', 'monospace'],
        'digital': ['JetBrains Mono', 'Courier New', 'monospace'],
      },
      letterSpacing: {
        'digital': '0.05em',
        'wide-digital': '0.1em',
      }
    },
  },
  plugins: [],
}
