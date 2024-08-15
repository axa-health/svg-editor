import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';
import { glob } from 'glob';
import { copyFile } from 'fs/promises';

export default defineConfig({
  plugins: [
    react(),
    dts({
      include: 'lib',
      afterBuild: async () => {
        const files = glob.sync('dist/**/*.d.ts', { nodir: true });
        await Promise.all(
          files.map(async (file) => {
            const newFilePath = file.replace(/\.d\.ts$/, '.d.cts');
            await copyFile(file, newFilePath);
          }),
        );
      },
    }),
  ],
  build: {
    copyPublicDir: false,
    lib: {
      entry: resolve(__dirname, 'lib/index.ts'),
      formats: ['cjs', 'es'],
      fileName: 'index',
    },
    rollupOptions: {
      external: ['react', 'react/jsx-runtime'],
    },
    // Reduce bloat from legacy polyfills.
    target: 'esnext',
    // Leave minification up to applications.
    minify: false,
  },
});
