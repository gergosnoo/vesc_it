/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // VESC Playground theme
        vesc: {
          primary: '#22c55e',    // Green - safe
          warning: '#eab308',    // Yellow - caution
          danger: '#ef4444',     // Red - danger
          critical: '#dc2626',   // Dark red - critical
          dark: '#0f172a',       // Slate 900
          darker: '#020617',     // Slate 950
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-gentle': 'bounce 2s infinite',
      },
    },
  },
  plugins: [],
}
