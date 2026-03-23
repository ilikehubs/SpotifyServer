import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import { SpotifyPlaylist } from '../types';
import styles from './Home.module.css';

export default function Home() {
  const { isAuthenticated, loading, login } = useAuth();
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    setFetching(true);
    api
      .get('/spotify/playlists')
      .then((res) => setPlaylists(res.data.items ?? []))
      .catch(console.error)
      .finally(() => setFetching(false));
  }, [isAuthenticated]);

  if (loading) return <p className={styles.hint}>Loading...</p>;

  if (!isAuthenticated) {
    return (
      <div className={styles.login}>
        <h1>Spotify Playlist Manager</h1>
        <p>Connect your Spotify account to get started.</p>
        <button className={styles.loginBtn} onClick={login}>
          Connect with Spotify
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1 className={styles.title}>Your Playlists</h1>
      {fetching && <p className={styles.hint}>Loading playlists...</p>}
      <div className={styles.grid}>
        {playlists.map((p) => (
          <div key={p.id} className={styles.card}>
            {p.images[0] && (
              <img className={styles.cover} src={p.images[0].url} alt={p.name} />
            )}
            <div className={styles.info}>
              <span className={styles.name}>{p.name}</span>
              <span className={styles.count}>{p.tracks.total} tracks</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
