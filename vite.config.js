import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // 🚀 ENGE MUHIMI: SPA loyihalarda subroute refresh (yangilash) ishlashi uchun bu majburiy!
  // Agar bu qo'yilmasa yoki './' bo'lsa, /apps sahifasida refresh qilsangiz assetlar 404 bo'ladi.
  base: '/', 
  
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true, // Har safar build bo'lganda dist papkasini tozalaydi
  }
})