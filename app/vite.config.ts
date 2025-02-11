import { defineConfig } from "vite";
import symfonyPlugin from "vite-plugin-symfony";
import vue from "@vitejs/plugin-vue";
import path from "path";

export default defineConfig({
    plugins: [
        vue(),
        symfonyPlugin(),
    ],
    build: {
        rollupOptions: {
            input: {
                'main': "./assets/js/main/main.js",
                'charter-search': "./assets/js/main/charter-search.js",
                'charter-view': "./assets/js/main/charter-view.js",
                'tradition-view': "./assets/js/main/tradition-view.js"
            },
        }
    },
    server: {
        // Respond to all network requests
        host: true,
        port: 5173,
        strictPort: true,
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './assets/js'),
            'vue': 'vue/dist/vue.esm-bundler',
        },
        extensions: ['.js', '.ts', '.tsx', '.jsx', '.vue'],
    },
    css: {
        preprocessorOptions: {
            scss: {
                // hide sass deprecations
                quietDeps: true
            }
        }
    }
});
