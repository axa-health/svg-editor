import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['lib/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  deps: { neverBundle: ['react', 'react/jsx-runtime', 'react-dom', 'pdfjs-dist'] },
  target: 'esnext',
  outDir: 'dist',
});

