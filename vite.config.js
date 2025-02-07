import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/', // Asegura que los assets se sirvan correctamente en Vercel
  server: {
    port: 3000, // Puerto para desarrollo
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:5001', // Redirige las llamadas al backend
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist', // Carpeta de salida para el build
    sourcemap: true, // Habilita los mapas de origen para depuración
  },
});
