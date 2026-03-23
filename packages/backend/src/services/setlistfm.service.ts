import axios, { AxiosInstance } from 'axios';
import { env } from '../config/env';

const BASE_URL = 'https://api.setlist.fm/rest/1.0';

export class SetlistFmService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      headers: {
        'x-api-key': env.SETLISTFM_API_KEY,
        Accept: 'application/json',
      },
    });
  }

  async searchArtist(name: string, page = 1) {
    const res = await this.client.get('/search/artists', {
      params: { artistName: name, p: page, sort: 'relevance' },
    });
    return res.data;
  }

  async getArtistSetlists(mbid: string, page = 1) {
    const res = await this.client.get(`/artist/${mbid}/setlists`, {
      params: { p: page },
    });
    return res.data;
  }

  async getSetlist(id: string) {
    const res = await this.client.get(`/setlist/${id}`);
    return res.data;
  }
}
