import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // ВАЖНО: Это название вашего репозитория. Если репозиторий называется 'menu', оставьте как есть.
  // Если по-другому, поменяйте '/menu/' на '/ваше-название/'.
  base: '/menu/', 
  build: {
    outDir: 'dist',
  }
})
