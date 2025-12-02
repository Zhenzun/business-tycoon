/** @type {import('tailwindcss').Config} */
module.exports = {
  // Tentukan path ke semua file yang menggunakan class Tailwind
  content: [
    "./app/**/*.{js,jsx,ts,tsx}", 
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Palet Warna Khusus Game Tycoon
        brand: {
          primary: '#3b82f6', // Biru Utama
          secondary: '#1e40af', 
          accent: '#f59e0b', // Emas/Highlight
        },
        game: {
          bg: '#0f172a',      // Background Gelap (Slate 900)
          card: '#1e293b',    // Card Item (Slate 800)
          money: '#10B981',   // Hijau Duit (Emerald 500)
          locked: '#64748b',  // Abu-abu Locked
          danger: '#ef4444',  // Merah Error/Cost
        }
      },
      fontFamily: {
        // Jika nanti kamu tambah custom font (misal: Font Pixel/Retro)
        // 'game': ['PixelFont', 'sans-serif'],
      }
    },
  },
  plugins: [],
}