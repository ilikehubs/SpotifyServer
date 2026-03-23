import axios, { AxiosInstance } from 'axios';

const BASE_URL = 'https://api.spotify.com/v1';

export class SpotifyService {
  private client: AxiosInstance;

  constructor(accessToken: string) {
    this.client = axios.create({
      baseURL: BASE_URL,
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  }

  async getMe() {
    const res = await this.client.get('/me');
    return res.data;
  }

  async getUserPlaylists() {
    const res = await this.client.get('/me/playlists?limit=50');
    return res.data;
  }

  async createPlaylist(name: string, description: string, trackUris: string[]) {
    const me = await this.getMe();
    const playlist = await this.client.post(`/users/${me.id}/playlists`, {
      name,
      description,
      public: false,
    });
    if (trackUris.length > 0) {
      await this.addTracksToPlaylist(playlist.data.id, trackUris);
    }
    return playlist.data;
  }

  async addTracksToPlaylist(playlistId: string, trackUris: string[]) {
    // Spotify allows max 100 tracks per request
    for (let i = 0; i < trackUris.length; i += 100) {
      const chunk = trackUris.slice(i, i + 100);
      await this.client.post(`/playlists/${playlistId}/tracks`, { uris: chunk });
    }
  }

  async search(query: string, type: string) {
    const res = await this.client.get(
      `/search?q=${encodeURIComponent(query)}&type=${type}&limit=5`
    );
    return res.data;
  }
}
