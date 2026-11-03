import react from '@vitejs/plugin-react';
import { readFileSync } from 'node:fs';
import { defineConfig } from 'vitest/config';

const packageJson = JSON.parse(readFileSync(new URL('package.json', import.meta.url), 'utf8')) as {
  peerDependencies: Record<string, string>;
};

const externalPackages = Object.keys(packageJson.peerDependencies);

export default defineConfig({
  build: {
    copyPublicDir: false,
    minify: false,
    emptyOutDir: true,
    lib: {
      entry: { index: 'src/index.ts', names: 'src/names.ts' },
      formats: ['es'],
    },
    rolldownOptions: {
      external: (id) => {
        return externalPackages.some((name) => {
          return id === name || id.startsWith(`${name}/`);
        });
      },
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].js',
      },
    },
    sourcemap: true,
  },
  plugins: [react()],
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}', 'test/**/*.test.{ts,tsx}'],
  },
});
