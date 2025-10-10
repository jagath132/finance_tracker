/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Keep this as 'class'
  theme: {
    extend: {
      colors: {
        // Dark theme colors (prefixed with 'dark-')
        'dark-primary': '#121212',
        'dark-secondary': '#1E1E1E',
        'dark-text': '#E0E0E0',
        'dark-text-secondary': '#A0A0A0',
        'dark-border': '#333333',

        // Light theme colors
        'light-primary': '#F5F5F5',
        'light-secondary': '#FFFFFF',
        'light-text': '#1F2937',
        'light-text-secondary': '#6B7280',
        'light-border': '#E5E7EB',

        // Brand colors
        'brand-green': '#22C55E',
        'brand-red': '#EF4444',
        'brand-yellow': '#F59E0B',
      }
    },
  },
  plugins: [],
}
