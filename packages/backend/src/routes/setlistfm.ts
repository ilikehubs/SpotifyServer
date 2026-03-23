import { Router, Request, Response } from 'express';
import { SetlistFmService } from '../services/setlistfm.service';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.use(requireAuth);

router.get('/search/artist', async (req: Request, res: Response) => {
  try {
    const service = new SetlistFmService();
    const { name, page = '1' } = req.query;
    const artists = await service.searchArtist(name as string, Number(page));
    res.json(artists);
  } catch {
    res.status(500).json({ error: 'Failed to search artist' });
  }
});

router.get('/artist/:mbid/setlists', async (req: Request, res: Response) => {
  try {
    const service = new SetlistFmService();
    const { page = '1' } = req.query;
    const setlists = await service.getArtistSetlists(req.params.mbid, Number(page));
    res.json(setlists);
  } catch {
    res.status(500).json({ error: 'Failed to fetch setlists' });
  }
});

router.get('/setlist/:id', async (req: Request, res: Response) => {
  try {
    const service = new SetlistFmService();
    const setlist = await service.getSetlist(req.params.id);
    res.json(setlist);
  } catch {
    res.status(500).json({ error: 'Failed to fetch setlist' });
  }
});

export default router;
