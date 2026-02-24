import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/futurable-app/', // ← nombre exacto de tu repo en GitHub
})