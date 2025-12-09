import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    server: {
      port: parseInt(env.VITE_PORT || '3001'),
      open: true,
      proxy: {
        '/graphql': {
          target: env.VITE_BACKEND_URL || 'http://localhost:8082',
          changeOrigin: true,
          secure: false,
        }
      }
    }
  };
});
