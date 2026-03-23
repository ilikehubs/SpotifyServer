export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  images: { url: string }[];
  tracks: { total: number };
  external_urls: { spotify: string };
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: { name: string }[];
  album: { name: string; images: { url: string }[] };
  uri: string;
}

export interface SetlistFmArtist {
  mbid: string;
  name: string;
  sortName: string;
  url: string;
}

export interface SetlistFmSong {
  name: string;
  with?: { name: string };
  cover?: { mbid: string; name: string };
  tape?: boolean;
}

export interface SetlistFmSet {
  name?: string;
  encore?: number;
  song: SetlistFmSong[];
}

export interface SetlistFmSetlist {
  id: string;
  eventDate: string;
  artist: SetlistFmArtist;
  venue: {
    name: string;
    city: { name: string; country: { name: string } };
  };
  sets: { set: SetlistFmSet[] };
  url: string;
}
