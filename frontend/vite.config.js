import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Khi chạy `npm run dev`, chuyển các yêu cầu /api sang Apache của XAMPP (thư mục htdocs/okr/api).
// Đổi địa chỉ bằng biến VITE_API_TARGET, ví dụ http://localhost:8080
const target = process.env.VITE_API_TARGET || 'http://localhost'

export default defineConfig({
  base: process.env.VITE_BASE || '/',
  plugins: [react()],
  server: {
    port: 5173,
    proxy: { '/api': { target, changeOrigin: true, rewrite: (p) => p.replace(/^\/api/, '/okr/api') } },
  },
})
