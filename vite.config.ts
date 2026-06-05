import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
// export default defineConfig({
//   plugins: [react()],
//   optimizeDeps: {
//     exclude: ['lucide-react'],
//   },
// });

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    define: {
      'process.env': Object.fromEntries(
        Object.entries(env).map(([key, val]) => [key, JSON.stringify(val)])
      ),
    },
    plugins: [react()],
    // Ensure environment variables are properly exposed
    envPrefix: 'VITE_',
  };
});