import dotenv from 'dotenv';
import path from 'path';

// Load .env from project root (two levels above packages/backend)
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || '3001',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  SESSION_SECRET: process.env.SESSION_SECRET || 'change-me-in-production',

  SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID || '',
  SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET || '',
  SPOTIFY_REDIRECT_URI:
    process.env.SPOTIFY_REDIRECT_URI || 'http://localhost:3001/api/auth/callback',

  SETLISTFM_API_KEY: process.env.SETLISTFM_API_KEY || '',
};
