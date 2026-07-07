import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// We'll write a simple fallback SVG icon if the imports fail, but using simple markup
export const Sidebar = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) return null;

  const links = [
    { name: 'Debate Arena', path: '/debate', icon: '💬' },
    { name: 'History', path: '/history', icon: '📜' },
    { name: 'Profile Settings', path: '/profile', icon: '👤' }
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-bg-secondary border-r border-border min-h-[calc(100vh-73px)] p-6 gap-6">
      <div className="text-xs font-bold uppercase tracking-wider text-muted font-heading">
        Navigation
      </div>
      <nav className="flex flex-col gap-2">
        {links.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-heading font-medium
                transition-all duration-200
                ${isActive 
                  ? 'bg-accent/10 text-accent border border-accent/20' 
                  : 'text-secondary hover:text-primary hover:bg-surface-raised border border-transparent'
                }
              `}
            >
              <span className="text-lg">{link.icon}</span>
              <span>{link.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-border pt-6 flex flex-col gap-3">
        <div className="text-xs text-muted">
          <p className="font-semibold text-primary mb-1">Quick Tip</p>
          Press <kbd className="px-1.5 py-0.5 rounded bg-surface border border-border text-[10px] font-mono">Enter</kbd> in the input box to start a new debate immediately!
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
