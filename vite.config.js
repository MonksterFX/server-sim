import { defineConfig } from 'vite'

export default defineConfig({
  root: 'src/ui',
  build: {
    outDir: '../../public',
    emptyOutDir: true
  }
})
