import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Allows the tunnel/network to access the server
    allowedHosts: ["mangily-supersensible-sherryl.ngrok-free.dev", ".ngrok-free.dev", ".ngrok-free.app", ".loca.lt"], // Safelist for tunnels
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/api'), // explicit verification
      },
      '/uploads': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
