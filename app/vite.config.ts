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
                'main': "./assets/js/apps/main.js",
                'charter-search': "./assets/js/apps/charter-search.js",
                'charter-view': "./assets/js/apps/charter-view.js",
                'tradition-view': "./assets/js/apps/tradition-view.js",
                'tradition-search': "./assets/js/apps/tradition-search.js"
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
