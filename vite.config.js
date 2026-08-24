import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Le site est publié sur https://petite-olive-verte.github.io/jeux-de-l-adresse/
  base: '/jeux-de-l-adresse/',
  plugins: [react()],
})
