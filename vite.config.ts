import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
    // server: {
    //     port: 8080,
    // },
    plugins: [vue()],
    build: {
        minify: 'esbuild',
        sourcemap: false,
    },
    resolve: {
        alias: {
            '@': path.join(__dirname, 'src')
        }
    },
    define: {
        // echarts: "echarts"
    }
})
