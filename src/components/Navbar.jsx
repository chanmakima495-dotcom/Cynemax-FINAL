import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Search, Menu, X, Tv, Film, Home } from 'lucide-react';

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 shrink-0">
      <div className="w-8 h-8 rounded-xl overflow-hidden bg-brand-500 flex items-center justify-center shadow-lg shadow-brand-500/30">
        <span className="text-white font-black text-xs leading-none">CX</span>
      </div>
      <span className="text-lg font-black tracking-tight hidden sm:block">
        <span className="text-white">Cynema</span><span className="text-brand-400">X</span>
        <span className="text-gray-500 text-xs font-semibold ml-1">BD</span>
      </span>
    </Link>
  );
}

export default function Navbar() {
  const [scrolled,    setScrolled]    = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  function handleSearch(e) {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileOpen(false);
    }
  }

  const linkClass = ({ isActive }) =>
    `flex items-center gap-1.5 text-sm font-medium transition-colors ${
      isActive ? 'text-brand-400' : 'text-gray-300 hover:text-white'
    }`;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || mobileOpen ? 'glass shadow-lg' : 'bg-gradient-to-b from-black/70 to-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Logo />

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            <NavLink to="/" className={linkClass} end>
              <Home className="w-4 h-4" /> Home
            </NavLink>
            <NavLink to="/movies" className={linkClass}>
              <Film className="w-4 h-4" /> Movies
            </NavLink>
            <NavLink to="/tv" className={linkClass}>
              <Tv className="w-4 h-4" /> TV Shows
            </NavLink>
          </nav>

          {/* Search + mobile toggle */}
          <div className="flex items-center gap-3">
            <form onSubmit={handleSearch} className="hidden sm:flex items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-dark-700 border border-dark-500 rounded-full pl-9 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 w-44 focus:w-60 transition-all duration-300"
                />
              </div>
            </form>

            <button
              onClick={() => navigate('/search')}
              className="sm:hidden p-2 text-gray-300 hover:text-white"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            <button
              onClick={() => setMobileOpen((p) => !p)}
              className="md:hidden p-2 text-gray-300 hover:text-white"
              aria-label="Menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <nav className="md:hidden pb-4 border-t border-dark-600 mt-2 pt-4 animate-fade-in">
            <div className="flex flex-col gap-1">
              {[
                { to: '/',       label: 'Home',     Icon: Home },
                { to: '/movies', label: 'Movies',   Icon: Film },
                { to: '/tv',     label: 'TV Shows', Icon: Tv   },
              ].map(({ to, label, Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-brand-500/10 text-brand-400'
                        : 'text-gray-300 hover:text-white hover:bg-dark-700'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </NavLink>
              ))}
              {/* Mobile search */}
              <form onSubmit={handleSearch} className="px-3 pt-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-dark-700 border border-dark-500 rounded-full pl-9 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </form>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
