// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';

// export default defineConfig({
//   plugins: [react()],
//   server: {
//     port: 5173,
//     proxy: {
//       '/api': { target: 'http://localhost:5000', changeOrigin: true },
//       '/uploads': { target: 'http://localhost:5000', changeOrigin: true }
//     }
//   }
// });




import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    // ✅ Désactive la minification agressive qui casse React sur Vercel
    target: 'es2015',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          query: ['@tanstack/react-query'],
        }
      }
    }
  },
  server: {
    port: 3000
  }
});