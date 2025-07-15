import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
      // "APP_URL": JSON.stringify("https://app.srtr.me"),
      // "API_URL": JSON.stringify("https://app.srtr.me/api/"), // For Live build
      "APP_URL": JSON.stringify('https://shortlydev.srtr.me/api/'),
      "API_URL": JSON.stringify("https://shortlydev.srtr.me/api/"),  //  For Development build
      "CUSTOM_DOMAIN": JSON.stringify("srtr.me/")
    },
})
