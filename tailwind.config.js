/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}", // Jaga-jaga kalau folder src ada
  ],
  theme: {
    extend: {
      colors: {
        pixel: {
          bg: "#201c2b",
          accent: "#e53b44",
        }
      },
      keyframes: {
        // Logika Sprite Sheet: Lebar 384px, Geser ke Y -128px (Baris 3)
        sprite: {
          '0%': { backgroundPosition: '0px -128px' },
          '100%': { backgroundPosition: '-384px -128px' },
        },
      },
      animation: {
        idle: 'sprite 0.8s steps(8) infinite',
        walk: 'sprite 0.8s steps(8) infinite',
        dash: 'sprite 0.5s steps(8) infinite',
        dust: 'sprite 0.5s steps(8) infinite',
      }
    },
  },
  plugins: [],
}