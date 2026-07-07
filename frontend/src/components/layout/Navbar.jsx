import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getInitials } from '../../utils/helpers';
import Button from '../ui/Button';

export const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isThemeDark, setIsThemeDark] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Sync theme with HTML class
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    const isDark = savedTheme !== 'light';
    setIsThemeDark(isDark);
    if (isDark) {
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
    }
  }, []);

  const toggleTheme = () => {
    const nextDark = !isThemeDark;
    setIsThemeDark(nextDark);
    localStorage.setItem('theme', nextDark ? 'dark' : 'light');
    if (nextDark) {
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const activeClass = (path) =>
    location.pathname === path
      ? 'text-accent font-semibold border-b-2 border-accent'
      : 'text-secondary hover:text-primary transition-colors';

  return (
    <nav className="sticky top-0 z-40 w-full glass border-b border-border py-4 px-6 md:px-12 flex items-center justify-between">
      {/* Brand Logo */}
      <Link to="/" className="flex items-center gap-2">
        <span className="text-2xl font-extrabold font-heading tracking-tight gradient-text select-none">
          PanelGPT
        </span>
        <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold rounded-md bg-accent/10 text-accent border border-accent/20">
          PRO
        </span>
      </Link>

      {/* Navigation Links */}
      {isAuthenticated && (
        <div className="hidden md:flex items-center gap-8 font-heading text-sm">
          <Link to="/debate" className={`${activeClass('/debate')} pb-1`}>
            Debate Arena
          </Link>
          <Link to="/history" className={`${activeClass('/history')} pb-1`}>
            History
          </Link>
          <Link to="/profile" className={`${activeClass('/profile')} pb-1`}>
            Profile
          </Link>
        </div>
      )}

      {/* Right Side Options */}
      <div className="flex items-center gap-4">
        {/* Dark/Light mode Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl border border-border bg-surface-raised hover:bg-surface-overlay text-secondary hover:text-primary transition-all cursor-pointer"
          title="Toggle Theme"
        >
          {isThemeDark ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>

        {isAuthenticated ? (
          <div className="relative">
            {/* User Avatar Dropdown Button */}
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 focus:outline-none cursor-pointer"
            >
              <div
                style={{ backgroundColor: user?.avatarColor || '#6366F1' }}
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md"
              >
                {getInitials(user?.displayName || user?.username)}
              </div>
            </button>

            {/* Profile Dropdown Menu */}
            {isProfileOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setIsProfileOpen(false)} />
                <div className="absolute right-0 mt-3 w-56 bg-surface border border-border rounded-xl shadow-glass overflow-hidden z-40 py-1">
                  <div className="px-4 py-3 border-b border-border">
                    <p className="text-sm font-semibold text-primary truncate">{user?.displayName}</p>
                    <p className="text-xs text-secondary truncate">{user?.email}</p>
                  </div>
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-secondary hover:text-primary hover:bg-surface-raised transition-colors"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    My Profile
                  </Link>
                  <Link
                    to="/history"
                    className="block px-4 py-2 text-sm text-secondary hover:text-primary hover:bg-surface-raised transition-colors"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    Debate History
                  </Link>
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      handleLogout();
                    }}
                    className="w-full text-left block px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer border-t border-border mt-1"
                  >
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Log In
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="primary" size="sm">
                Get Started
              </Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
