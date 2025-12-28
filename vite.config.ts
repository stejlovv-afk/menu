import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Мы меняем '/menu/' на './', чтобы приложение работало и на GitHub, и на IP сервера
  base: './', 
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Это поможет избежать проблем с путями к картинкам
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    host: true
  }
});
