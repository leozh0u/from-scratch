import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  /*
   * Served from the root on Vercel, and from /from-scratch/ on GitHub Pages in
   * Leo's fork (.github/workflows/pages.yml sets it). Every asset the game
   * loads already goes through `import.meta.env.BASE_URL`, so this one line is
   * the whole of the difference.
   */
  base: process.env.BASE_PATH || '/',
})
