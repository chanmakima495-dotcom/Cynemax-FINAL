import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-dark-700 bg-dark-800 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">

          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center">
              <span className="text-white font-black text-xs">CX</span>
            </div>
            <span className="font-black text-white">
              Cynema<span className="text-brand-400">X</span>
              <span className="text-gray-500 text-xs font-semibold ml-1">BD</span>
            </span>
          </Link>

          <nav className="flex gap-5 text-sm text-gray-400">
            {[['/', 'Home'], ['/movies', 'Movies'], ['/tv', 'TV Shows'], ['/search', 'Search']].map(([to, label]) => (
              <Link key={to} to={to} className="hover:text-white transition-colors">{label}</Link>
            ))}
          </nav>
        </div>

        <div className="mt-8 pt-6 border-t border-dark-700 text-center text-xs text-gray-600 space-y-1">
          <p>© {new Date().getFullYear()} CynemaX BD — For entertainment purposes only.</p>
          <p>Content is sourced from third-party providers. CynemaX BD does not host any media files.</p>
          <p className="text-gray-700 mt-2">Developed by <span className="text-gray-500">Shouko Nishimiya</span></p>
        </div>
      </div>
    </footer>
  );
}
