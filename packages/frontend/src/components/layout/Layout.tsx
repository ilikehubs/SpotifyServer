import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import styles from './Layout.module.css';

export default function Layout({ children }: { children: ReactNode }) {
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();

  return (
    <div className={styles.wrapper}>
      <nav className={styles.nav}>
        <span className={styles.logo}>Spotify Manager</span>
        <div className={styles.links}>
          <Link className={location.pathname === '/' ? styles.active : ''} to="/">
            Playlists
          </Link>
          <Link
            className={location.pathname === '/setlist-import' ? styles.active : ''}
            to="/setlist-import"
          >
            Import Setlist
          </Link>
        </div>
        {isAuthenticated && (
          <button className={styles.logoutBtn} onClick={logout}>
            Logout
          </button>
        )}
      </nav>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
