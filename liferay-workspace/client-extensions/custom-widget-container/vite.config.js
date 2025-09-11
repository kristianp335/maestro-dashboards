import { defineConfig } from 'vite';
import path from 'path';

const local = process.env.LOCAL_DEV === 'true';

export default defineConfig({
    plugins: [],
    build: {
        rollupOptions: {
            external: local
                ? []  
                : [
                    '@clayui/*',
                    'react',
                    'react-dom'
                ]
        },
        outDir: path.resolve(__dirname, 'build/static'),
        emptyOutDir: true,
        assetsDir: 'assets',
    }
});