import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Home, ThumbsUp, Clock, User as UserIcon, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getSubscribedChannels } from '../api/subscription.api';
import Avatar from './ui/Avatar';
import Spinner from './ui/Spinner';

export const Sidebar = () => {
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { sidebarOpen } = useSelector((state) => state.ui);

  const [subscriptions, setSubscriptions] = useState([]);
  const [loadingSubs, setLoadingSubs] = useState(false);

  // Fetch subscriptions on mount/auth state change
  useEffect(() => {
    if (isAuthenticated && user?._id) {
      setLoadingSubs(true);
      getSubscribedChannels(user._id)
        .then((data) => {
          setSubscriptions(data.channels || []);
        })
        .catch(() => {
          setSubscriptions([]);
        })
        .finally(() => {
          setLoadingSubs(false);
        });
    } else {
      setSubscriptions([]);
    }
  }, [isAuthenticated, user?._id]);

  const navLinks = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/liked-videos', label: 'Liked Videos', icon: ThumbsUp },
    { to: '/history', label: 'History', icon: Clock },
    {
      to: isAuthenticated ? `/channel/${user?.username}` : '/login',
      label: 'My Channel',
      icon: UserIcon,
    },
    {
      to: isAuthenticated ? '/dashboard' : '/login',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
  ];

  return (
    <aside
      className={`fixed top-14 bottom-0 left-0 z-30 flex flex-col border-r border-border bg-bg-secondary transition-all duration-200 select-none ${
        sidebarOpen ? 'w-64' : 'w-20'
      }`}
    >
      {/* Scrollable Navigation Area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-4">
        {/* Main Links */}
        <nav className="flex flex-col gap-1">
          {navLinks.map(({ to, label, icon: Icon }) => {
            const isActive = location.pathname === to;

            if (sidebarOpen) {
              // Wide Mode: Horizontal item with Icon + Text
              return (
                <NavLink
                  key={to}
                  to={to}
                  className={`flex items-center gap-4 rounded-lg px-4 py-2.5 text-sm transition-colors ${
                    isActive
                      ? 'bg-accent/10 text-accent font-semibold'
                      : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
                  }`}
                >
                  <Icon size={20} className={isActive ? 'text-accent' : ''} />
                  <span className="truncate">{label}</span>
                </NavLink>
              );
            } else {
              // Collapsed Mode: Vertical stacked item
              return (
                <NavLink
                  key={to}
                  to={to}
                  className={`flex flex-col items-center justify-center rounded-lg py-2.5 text-center transition-all ${
                    isActive
                      ? 'bg-accent/10 text-accent font-bold'
                      : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
                  }`}
                  title={label}
                >
                  <Icon size={20} className={isActive ? 'text-accent' : ''} />
                  <span className="mt-1 text-[10px] font-medium tracking-tight truncate max-w-full px-1">
                    {label}
                  </span>
                </NavLink>
              );
            }
          })}
        </nav>

        {/* Subscriptions Section (Only visible in wide mode, or as small avatars stack when collapsed) */}
        {sidebarOpen ? (
          <div className="border-t border-border pt-4">
            <h3 className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-text-muted">
              Subscriptions
            </h3>
            {loadingSubs ? (
              <div className="flex justify-center py-4">
                <Spinner size="sm" />
              </div>
            ) : subscriptions.length > 0 ? (
              <div className="flex flex-col gap-1">
                {subscriptions.map((subChannel) => (
                  <NavLink
                    key={subChannel._id}
                    to={`/channel/${subChannel.username}`}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-lg px-4 py-2 text-sm transition-colors ${
                        isActive
                          ? 'bg-accent/10 text-accent font-semibold'
                          : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
                      }`
                    }
                  >
                    <Avatar
                      src={subChannel.avatar}
                      alt={subChannel.fullName || subChannel.username}
                      size="sm"
                      className="h-6 w-6 border-none"
                    />
                    <span className="truncate">
                      {subChannel.fullName || subChannel.username}
                    </span>
                  </NavLink>
                ))}
              </div>
            ) : (
              <p className="px-4 py-2 text-xs text-text-muted">
                {isAuthenticated ? 'No subscriptions yet' : 'Sign in to see subscriptions'}
              </p>
            )}
          </div>
        ) : (
          isAuthenticated && subscriptions.length > 0 && (
            <div className="border-t border-border pt-4 flex flex-col items-center gap-3">
              {subscriptions.slice(0, 5).map((subChannel) => (
                <NavLink
                  key={subChannel._id}
                  to={`/channel/${subChannel.username}`}
                  className="transition-transform hover:scale-105 active:scale-95"
                  title={subChannel.fullName || subChannel.username}
                >
                  <Avatar
                    src={subChannel.avatar}
                    alt={subChannel.fullName || subChannel.username}
                    size="sm"
                    className="h-8 w-8 border-none hover:ring-2 hover:ring-accent"
                  />
                </NavLink>
              ))}
            </div>
          )
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
