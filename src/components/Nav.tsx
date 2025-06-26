// src/components/Nav.tsx
import { Link, useLocation } from 'react-router-dom';

export function Nav() {
  const { pathname } = useLocation();

  const linkClasses = (path: string) =>
    `px-4 py-2 rounded hover:bg-gray-700 transition ${
      pathname === path ? 'bg-gray-700 text-white' : 'text-gray-300'
    }`;

  return (
    <nav className="bg-gray-800 p-4 shadow">
      <div className="max-w-7xl mx-auto flex gap-4">
        <Link to="/" className={linkClasses('/')}>
          Dashboard
        </Link>
        <Link to="/restream" className={linkClasses('/restream')}>
          Restream
        </Link>
        <Link to="/messaging" className={linkClasses('/messaging')}>
          Messaging
        </Link>
      </div>
    </nav>
  );
}
