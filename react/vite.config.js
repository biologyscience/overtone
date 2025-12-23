import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from '@svgr/rollup'

// https://vite.dev/config/
export default defineConfig({
    base: './',
    plugins: [react(), svgr({svgoConfig: {plugins: [{name: 'prefixIds', fn: () => {}}]}})],
    server: {port: 8520}
})