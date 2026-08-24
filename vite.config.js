import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Le site est publié sur https://petite-olive-verte.github.io/betclash-event-olympiade-de-ladresse/
  base: '/betclash-event-olympiade-de-ladresse/',
  plugins: [react()],
})
