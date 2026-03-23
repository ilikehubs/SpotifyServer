import { Router } from 'express';
import axios from 'axios';
import { env } from '../config/env';

const router = Router();

const SCOPES = [
  'playlist-read-private',
  'playlist-modify-public',
  'playlist-modify-private',
  'user-library-read',
].join(' ');

router.get('/login', (_req, res) => {
  const params = new URLSearchParams({
    client_id: env.SPOTIFY_CLIENT_ID,
    response_type: 'code',
    redirect_uri: env.SPOTIFY_REDIRECT_URI,
    scope: SCOPES,
  });
  res.redirect(`https://accounts.spotify.com/authorize?${params}`);
});

router.get('/callback', async (req, res) => {
  const code = req.query.code as string;
  if (!code) {
    res.redirect(`${env.FRONTEND_URL}?error=missing_code`);
    return;
  }
  try {
    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: env.SPOTIFY_REDIRECT_URI,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(
            `${env.SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`
          ).toString('base64')}`,
        },
      }
    );
    req.session.accessToken = response.data.access_token;
    req.session.refreshToken = response.data.refresh_token;
    res.redirect(env.FRONTEND_URL);
  } catch {
    res.redirect(`${env.FRONTEND_URL}?error=auth_failed`);
  }
});

router.get('/status', (req, res) => {
  res.json({ authenticated: !!req.session.accessToken });
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

export default router;
