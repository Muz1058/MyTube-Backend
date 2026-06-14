import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Menu, Search, Video, LogIn, Settings, LogOut, LayoutDashboard, User as UserIcon } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { toggleSidebar } from '../store/slices/uiSlice';
import Avatar from './ui/Avatar';
import Button from './ui/Button';

const YoutubeLogo = () => (
  <svg viewBox="0 0 24 24" className="h-6 w-6 text-accent fill-accent shrink-0">
    <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.107C19.524 3.545 12 3.545 12 3.545s-7.525 0-9.387.511a3.002 3.002 0 0 0-2.11 2.107C0 8.025 0 12 0 12s0 3.975.503 5.837a2.999 2.999 0 0 0 2.11 2.107c1.862.511 9.387.511 9.387.511s7.525 0 9.387-.511a3.002 3.002 0 0 0 2.11-2.107C24 15.975 24 12 24 12s0-3.975-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

export const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated, signOut } = useAuth();
  const [searchParams] = useSearchParams();

  const [searchVal, setSearchVal] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Sync search input with URL search parameter
  useEffect(() => {
    setSearchVal(searchParams.get('query') || '');
  }, [searchParams]);

  // Click away listener for user profile dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/?query=${encodeURIComponent(searchVal.trim())}`);
    } else {
      navigate('/');
    }
  };

  const handleLogoutClick = async () => {
    setDropdownOpen(false);
    await signOut();
    navigate('/login');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 flex h-14 items-center justify-between border-b border-border bg-bg-secondary px-4 select-none">
      {/* Left section: Hamburger + Brand */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => dispatch(toggleSidebar())}
          className="rounded-full p-2 text-text-primary hover:bg-bg-hover transition-colors cursor-pointer"
          aria-label="Toggle navigation drawer"
        >
          <Menu size={20} />
        </button>
        <Link to="/" className="flex items-center gap-1.5 active:scale-[0.98] transition-all">
          <YoutubeLogo />
          <span className="text-xl font-bold tracking-tighter text-text-primary font-sans">
            MyTube
          </span>
        </Link>
      </div>

      {/* Center section: Search Bar */}
      <form
        onSubmit={handleSearchSubmit}
        className="flex max-w-lg flex-1 items-center rounded-full border border-border bg-bg-primary overflow-hidden focus-within:border-accent/50 focus-within:ring-1 focus-within:ring-accent/20 transition-all mx-4 md:mx-0"
      >
        <input
          type="text"
          placeholder="Search videos..."
          value={searchVal}
          onChange={(e) => setSearchVal(e.target.value)}
          className="w-full bg-transparent px-4 py-1.5 text-sm text-text-primary placeholder-text-muted outline-none"
        />
        <button
          type="submit"
          className="border-l border-border bg-bg-tertiary px-5 py-2 text-text-secondary hover:bg-bg-hover hover:text-text-primary transition-colors cursor-pointer flex items-center justify-center"
          aria-label="Search"
        >
          <Search size={16} />
        </button>
      </form>

      {/* Right section: Authentication options */}
      <div className="flex items-center gap-2">
        {isAuthenticated ? (
          <>
            {/* Upload Button */}
            <Link
              to="/upload"
              className="rounded-full p-2 text-text-primary hover:bg-bg-hover transition-colors hidden sm:flex"
              title="Upload Video"
            >
              <Video size={20} />
            </Link>

            {/* User Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex rounded-full focus:ring-2 focus:ring-accent/50 transition-all cursor-pointer"
              >
                <Avatar
                  src={user?.avatar}
                  alt={user?.fullName || user?.username || 'User Profile'}
                  size="sm"
                />
              </button>

              {/* Dropdown Menu card */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-lg border border-border bg-bg-secondary p-1.5 shadow-xl ring-1 ring-black/5 animate-in fade-in slide-in-from-top-1 duration-150">
                  {/* User Profile Summary Header */}
                  <div className="border-b border-border px-3 py-2 text-left">
                    <p className="text-sm font-bold text-text-primary truncate">
                      {user?.fullName || 'My Profile'}
                    </p>
                    <p className="text-xs text-text-secondary truncate">
                      @{user?.username || 'username'}
                    </p>
                  </div>

                  {/* Dropdown Links */}
                  <div className="py-1">
                    <Link
                      to={`/channel/${user?.username}`}
                      onClick={() => setDropdownOpen(false)}
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-text-secondary hover:bg-bg-hover hover:text-text-primary transition-colors"
                    >
                      <UserIcon size={16} />
                      My Channel
                    </Link>
                    <Link
                      to="/dashboard"
                      onClick={() => setDropdownOpen(false)}
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-text-secondary hover:bg-bg-hover hover:text-text-primary transition-colors"
                    >
                      <LayoutDashboard size={16} />
                      Dashboard
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setDropdownOpen(false)}
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-text-secondary hover:bg-bg-hover hover:text-text-primary transition-colors"
                    >
                      <Settings size={16} />
                      Settings
                    </Link>
                  </div>

                  {/* Logout Button */}
                  <div className="border-t border-border pt-1">
                    <button
                      type="button"
                      onClick={handleLogoutClick}
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                    >
                      <LogOut size={16} />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/login')}
            className="flex items-center gap-1.5 font-bold"
          >
            <LogIn size={14} />
            Sign in
          </Button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
