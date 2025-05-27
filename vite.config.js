import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    base: '/', // Asegura paths correctos en producción

    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:5001',
          changeOrigin: true,
          secure: false,
        },
      },
    },

    build: {
      outDir: 'dist',
      sourcemap: true,
    },

    resolve: {
      alias: {
        '@': '/src', // Soporte para importaciones tipo @/components
      },
    },
  };
});
