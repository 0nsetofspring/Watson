import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    headers: {
      // 기존에 추가했던 COOP 헤더
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
      // COEP 헤더를 추가합니다.
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
})