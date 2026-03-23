import express from 'express';
import cors from 'cors';
import session from 'express-session';
import path from 'path';
import { env } from './config/env';
import authRoutes from './routes/auth';
import spotifyRoutes from './routes/spotify';
import setlistfmRoutes from './routes/setlistfm';

const app = express();
const isProd = env.NODE_ENV === 'production';

// Trust the first proxy (cloudflared / reverse proxy) so secure cookies work over HTTPS
if (isProd) app.set('trust proxy', 1);

app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(
  session({
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: isProd, maxAge: 1000 * 60 * 60 * 24 },
  })
);

app.use('/api/auth', authRoutes);
app.use('/api/spotify', spotifyRoutes);
app.use('/api/setlistfm', setlistfmRoutes);

// In production the backend serves the built frontend
if (isProd) {
  const frontendDist = path.resolve(__dirname, '../../frontend/dist');
  app.use(express.static(frontendDist));
  // SPA fallback — let React Router handle client-side routes
  app.get('*', (_req, res) => res.sendFile(path.join(frontendDist, 'index.html')));
}

app.listen(env.PORT, () => {
  console.log(`Backend running on http://localhost:${env.PORT} [${env.NODE_ENV}]`);
});
