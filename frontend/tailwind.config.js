/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'custom-bg': '#1e1e1e',
        'llm-bubble': '#343541',
        'user-bubble': '#444654',
        'input-bar': '#40414f',
        'text-color': '#ececf1',
        'send-button': '#10a37f',
      },
    },
  },
  plugins: [],
}
