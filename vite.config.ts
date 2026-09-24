import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, (process as any).cwd(), '');

  const geminiApiKey =
    process.env.GEMINI_API_KEY ||
    process.env.API_KEY ||
    process.env.VITE_GEMINI_API_KEY ||
    process.env.VITE_GOOGLE_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.VITE_API_KEY ||
    env.GEMINI_API_KEY ||
    env.API_KEY ||
    env.VITE_GEMINI_API_KEY ||
    env.VITE_GOOGLE_API_KEY ||
    env.GOOGLE_API_KEY ||
    env.VITE_API_KEY ||
    '';

  const geminiModel =
    process.env.GEMINI_MODEL ||
    process.env.VITE_GEMINI_MODEL ||
    env.GEMINI_MODEL ||
    env.VITE_GEMINI_MODEL ||
    'gemini-2.5-flash';

  return {
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(geminiApiKey),
      'process.env.GEMINI_MODEL': JSON.stringify(geminiModel),
      'process.env.FIREBASE_API_KEY': JSON.stringify(env.FIREBASE_API_KEY || ''),
      'process.env.FIREBASE_AUTH_DOMAIN': JSON.stringify(env.FIREBASE_AUTH_DOMAIN || ''),
      'process.env.FIREBASE_PROJECT_ID': JSON.stringify(env.FIREBASE_PROJECT_ID || ''),
      'process.env.FIREBASE_STORAGE_BUCKET': JSON.stringify(env.FIREBASE_STORAGE_BUCKET || ''),
      'process.env.FIREBASE_MESSAGING_SENDER_ID': JSON.stringify(env.FIREBASE_MESSAGING_SENDER_ID || ''),
      'process.env.FIREBASE_APP_ID': JSON.stringify(env.FIREBASE_APP_ID || '')
    }
  };
});
