import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"
import tailwindcss from "@tailwindcss/vite"
import { config } from 'process'


// https://vite.dev/config/
export default defineConfig(({mode}) =>
  {
  // pick the proxy target based on the mode
  const backendTarget =
    mode === 'docker'
      ? 'http://backend:5000'    // inside Docker
      : 'http://localhost:5000'; // on your machine

  return {
    plugins: [react(), tailwindcss({config: "./tailwind.config.cjs"})],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"), 
      },
    },
    server:{
      host: true,
      port: 5173,
      proxy: {
        '/api': {
          target: backendTarget,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''), 
        }
      },
      watch: {
        usePolling: true,
      },
    }
  }

})
