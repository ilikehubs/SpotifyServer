import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import { SetlistFmArtist, SetlistFmSetlist, SetlistFmSong, SpotifyTrack } from '../types';
import styles from './SetlistImport.module.css';

type Step = 'artist' | 'setlist' | 'preview' | 'done';

interface TrackMatch {
  song: SetlistFmSong;
  spotifyTrack: SpotifyTrack | null;
  skipped: boolean;
}

export default function SetlistImport() {
  const { isAuthenticated, login } = useAuth();

  const [step, setStep] = useState<Step>('artist');
  const [artistQuery, setArtistQuery] = useState('');
  const [artists, setArtists] = useState<SetlistFmArtist[]>([]);
  const [selectedArtist, setSelectedArtist] = useState<SetlistFmArtist | null>(null);
  const [setlists, setSetlists] = useState<SetlistFmSetlist[]>([]);
  const [selectedSetlist, setSelectedSetlist] = useState<SetlistFmSetlist | null>(null);
  const [tracks, setTracks] = useState<TrackMatch[]>([]);
  const [playlistName, setPlaylistName] = useState('');
  const [loading, setLoading] = useState(false);
  const [createdUrl, setCreatedUrl] = useState('');
  const [error, setError] = useState('');

  if (!isAuthenticated) {
    return (
      <div className={styles.center}>
        <p>Please connect Spotify first.</p>
        <button className={styles.primaryBtn} onClick={login}>
          Connect Spotify
        </button>
      </div>
    );
  }

  // --- Step 1: search artist ---
  const searchArtist = async () => {
    if (!artistQuery.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/setlistfm/search/artist', { params: { name: artistQuery } });
      setArtists(res.data.artist ?? []);
    } catch {
      setError('Failed to search for artist.');
    } finally {
      setLoading(false);
    }
  };

  const selectArtist = async (artist: SetlistFmArtist) => {
    setSelectedArtist(artist);
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/setlistfm/artist/${artist.mbid}/setlists`);
      setSetlists(res.data.setlist ?? []);
      setStep('setlist');
    } catch {
      setError('Failed to load setlists.');
    } finally {
      setLoading(false);
    }
  };

  // --- Step 2: pick setlist, match songs on Spotify ---
  const selectSetlist = async (setlist: SetlistFmSetlist) => {
    setSelectedSetlist(setlist);
    setLoading(true);
    setError('');

    const allSongs: SetlistFmSong[] = setlist.sets.set.flatMap((s) => s.song);

    const matches: TrackMatch[] = await Promise.all(
      allSongs.map(async (song) => {
        try {
          const query = `${song.name} ${selectedArtist?.name ?? ''}`;
          const res = await api.get('/spotify/search', { params: { q: query, type: 'track' } });
          const items: SpotifyTrack[] = res.data.tracks?.items ?? [];
          return { song, spotifyTrack: items[0] ?? null, skipped: false };
        } catch {
          return { song, spotifyTrack: null, skipped: false };
        }
      })
    );

    setTracks(matches);
    setPlaylistName(
      `${selectedArtist?.name} – ${setlist.venue.city.name} ${setlist.eventDate}`
    );
    setStep('preview');
    setLoading(false);
  };

  // --- Step 3: preview & adjust ---
  const toggleSkip = (index: number) => {
    setTracks((prev) =>
      prev.map((t, i) => (i === index ? { ...t, skipped: !t.skipped } : t))
    );
  };

  const createPlaylist = async () => {
    setLoading(true);
    setError('');
    try {
      const trackUris = tracks
        .filter((t) => !t.skipped && t.spotifyTrack)
        .map((t) => t.spotifyTrack!.uri);

      const res = await api.post('/spotify/playlists', {
        name: playlistName,
        description: `Setlist from ${selectedSetlist?.venue.name} on ${selectedSetlist?.eventDate}. Imported via Spotify Manager.`,
        trackUris,
      });
      setCreatedUrl(res.data.external_urls?.spotify ?? '');
      setStep('done');
    } catch {
      setError('Failed to create playlist.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep('artist');
    setArtistQuery('');
    setArtists([]);
    setSelectedArtist(null);
    setSetlists([]);
    setSelectedSetlist(null);
    setTracks([]);
    setPlaylistName('');
    setCreatedUrl('');
    setError('');
  };

  // --- Render ---
  return (
    <div>
      <h1 className={styles.title}>Import Setlist</h1>

      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <span className={step === 'artist' ? styles.crumbActive : styles.crumb}>
          1. Artist
        </span>
        <span className={styles.sep}>/</span>
        <span className={step === 'setlist' ? styles.crumbActive : styles.crumb}>
          2. Setlist
        </span>
        <span className={styles.sep}>/</span>
        <span className={step === 'preview' ? styles.crumbActive : styles.crumb}>
          3. Preview
        </span>
        <span className={styles.sep}>/</span>
        <span className={step === 'done' ? styles.crumbActive : styles.crumb}>4. Done</span>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {/* Step 1 */}
      {step === 'artist' && (
        <div className={styles.section}>
          <p className={styles.hint}>Search for an artist on setlist.fm</p>
          <div className={styles.searchRow}>
            <input
              value={artistQuery}
              onChange={(e) => setArtistQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchArtist()}
              placeholder="e.g. Radiohead"
            />
            <button
              className={styles.primaryBtn}
              onClick={searchArtist}
              disabled={loading}
            >
              {loading ? 'Searching…' : 'Search'}
            </button>
          </div>
          <div className={styles.list}>
            {artists.map((a) => (
              <button key={a.mbid} className={styles.listItem} onClick={() => selectArtist(a)}>
                <span className={styles.itemName}>{a.name}</span>
                <span className={styles.itemSub}>{a.sortName}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2 */}
      {step === 'setlist' && selectedArtist && (
        <div className={styles.section}>
          <button className={styles.backBtn} onClick={() => setStep('artist')}>
            ← Back
          </button>
          <p className={styles.hint}>
            Setlists for <strong>{selectedArtist.name}</strong>
          </p>
          {loading && <p className={styles.hint}>Loading…</p>}
          <div className={styles.list}>
            {setlists.map((s) => {
              const songCount = s.sets.set.flatMap((set) => set.song).length;
              return (
                <button
                  key={s.id}
                  className={styles.listItem}
                  onClick={() => selectSetlist(s)}
                  disabled={songCount === 0}
                >
                  <span className={styles.itemName}>
                    {s.eventDate} — {s.venue.name}
                  </span>
                  <span className={styles.itemSub}>
                    {s.venue.city.name}, {s.venue.city.country.name} ·{' '}
                    {songCount > 0 ? `${songCount} songs` : 'no songs recorded'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 3 */}
      {step === 'preview' && (
        <div className={styles.section}>
          <button className={styles.backBtn} onClick={() => setStep('setlist')}>
            ← Back
          </button>
          {loading && <p className={styles.hint}>Matching songs on Spotify…</p>}
          {!loading && (
            <>
              <div className={styles.nameRow}>
                <label>Playlist name</label>
                <input
                  value={playlistName}
                  onChange={(e) => setPlaylistName(e.target.value)}
                />
              </div>
              <p className={styles.hint}>
                {tracks.filter((t) => !t.skipped && t.spotifyTrack).length} of{' '}
                {tracks.length} songs will be added. Click a row to skip it.
              </p>
              <div className={styles.trackList}>
                {tracks.map((t, i) => (
                  <div
                    key={i}
                    className={`${styles.trackRow} ${t.skipped ? styles.skipped : ''} ${!t.spotifyTrack ? styles.noMatch : ''}`}
                    onClick={() => toggleSkip(i)}
                  >
                    <span className={styles.trackIndex}>{i + 1}</span>
                    <div className={styles.trackInfo}>
                      <span className={styles.trackName}>{t.song.name}</span>
                      {t.spotifyTrack ? (
                        <span className={styles.trackMatch}>
                          → {t.spotifyTrack.name} ·{' '}
                          {t.spotifyTrack.artists.map((a) => a.name).join(', ')}
                        </span>
                      ) : (
                        <span className={styles.noMatchLabel}>No Spotify match found</span>
                      )}
                    </div>
                    <span className={styles.skipLabel}>
                      {t.skipped ? 'skipped' : t.spotifyTrack ? '✓' : '—'}
                    </span>
                  </div>
                ))}
              </div>
              <button
                className={styles.primaryBtn}
                onClick={createPlaylist}
                disabled={loading || !playlistName.trim()}
              >
                Create Playlist
              </button>
            </>
          )}
        </div>
      )}

      {/* Step 4 */}
      {step === 'done' && (
        <div className={styles.center}>
          <h2>Playlist created!</h2>
          {createdUrl && (
            <a className={styles.spotifyLink} href={createdUrl} target="_blank" rel="noreferrer">
              Open in Spotify
            </a>
          )}
          <button className={styles.primaryBtn} onClick={reset}>
            Import another
          </button>
        </div>
      )}
    </div>
  );
}
