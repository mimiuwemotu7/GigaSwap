/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  safelist: [
    // Theme classes that might be missed by purging
    'bg-white',
    'bg-gray-50',
    'bg-gray-100',
    'bg-gray-200',
    'bg-[#1f1f1f]',
    'bg-[#262626]',
    'text-gray-900',
    'text-gray-600',
    'text-gray-500',
    'text-white',
    'text-[#a3a3a3]',
    'text-[#737373]',
    'border-gray-100',
    'border-gray-200',
    'border-gray-300',
    'border-gray-800',
    'hover:bg-gray-100',
    'hover:bg-[#262626]',
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
