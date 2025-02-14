import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import symfonyPlugin from "vite-plugin-symfony";
import { viteStaticCopy } from 'vite-plugin-static-copy'
import path from "node:path";

export default defineConfig({
    plugins: [
        vue(),
        symfonyPlugin(),
        viteStaticCopy({
            targets: [
                {
                    src: './assets/images',
                    dest: 'images'
                }
            ]
        })
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
        host: 'localhost',
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
                quietDeps: true,
                // hide sass @import deprecations
                silenceDeprecations: ['import']
            }
        }
    }
});
