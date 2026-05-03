import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vitejs.dev/config/
export default defineConfig({
    base: './',
    plugins: [
        react(),
    ],
    server: {
        port: 8080
    },
    resolve: {
        alias: {
            '@core': path.resolve(__dirname, '../src/core'),
            '@i18n': path.resolve(__dirname, '../src/core/services/i18n'),
            '@domains': path.resolve(__dirname, '../src/domains'),
            '@ui': path.resolve(__dirname, '../src/presentation'),
            '@game': path.resolve(__dirname, '../src/game'),
            '@utils': path.resolve(__dirname, '../src/utils')
        }
    }
})
