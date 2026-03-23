import { Router, Request, Response } from 'express';
import { SpotifyService } from '../services/spotify.service';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.use(requireAuth);

router.get('/playlists', async (req: Request, res: Response) => {
  try {
    const service = new SpotifyService(req.session.accessToken!);
    const playlists = await service.getUserPlaylists();
    res.json(playlists);
  } catch {
    res.status(500).json({ error: 'Failed to fetch playlists' });
  }
});

router.post('/playlists', async (req: Request, res: Response) => {
  try {
    const service = new SpotifyService(req.session.accessToken!);
    const { name, description, trackUris } = req.body;
    const playlist = await service.createPlaylist(name, description, trackUris ?? []);
    res.json(playlist);
  } catch {
    res.status(500).json({ error: 'Failed to create playlist' });
  }
});

router.get('/search', async (req: Request, res: Response) => {
  try {
    const service = new SpotifyService(req.session.accessToken!);
    const { q, type = 'track' } = req.query;
    const results = await service.search(q as string, type as string);
    res.json(results);
  } catch {
    res.status(500).json({ error: 'Failed to search' });
  }
});

export default router;
