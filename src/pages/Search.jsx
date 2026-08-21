import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search as SearchIcon, Star } from 'lucide-react';
import { searchContent } from '../api/search';

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

const PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQ1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQ1MCIgZmlsbD0iIzFjMjUzNSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSI0OCIgZmlsbD0iIzM3NGQ2OCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuKZoTwvdGV4dD48L3N2Zz4=';

function ResultCard({ item }) {
  const [imgErr, setImgErr] = useState(false);
  const slug = item.slug || item.detailPath || item.detail_path;
  return (
    <Link to={`/detail/${slug}`} className="group flex gap-3 p-3 rounded-xl bg-dark-800 hover:bg-dark-700 border border-dark-700 hover:border-dark-500 transition-all duration-200">
      <div className="w-16 sm:w-20 shrink-0 rounded-lg overflow-hidden aspect-[2/3] bg-dark-700">
        <img
          src={imgErr ? PLACEHOLDER : (item.poster_url || item.cover?.url || PLACEHOLDER)}
          alt={item.name || item.title}
          className="w-full h-full object-cover"
          onError={() => setImgErr(true)}
          loading="lazy"
        />
      </div>
      <div className="flex flex-col justify-center gap-1 min-w-0">
        <h3 className="text-sm font-semibold text-white group-hover:text-brand-400 transition-colors truncate">
          {item.name || item.title}
        </h3>
        {item.rating && (
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
            <span className="text-xs text-yellow-400 font-medium">{parseFloat(item.rating).toFixed(1)}</span>
          </div>
        )}
        {item.badge && (
          <span className="text-xs bg-brand-500/20 text-brand-400 px-2 py-0.5 rounded w-fit font-medium">
            {item.badge}
          </span>
        )}
      </div>
    </Link>
  );
}

export default function Search() {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get('q') || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState(null);

  const debouncedQuery = useDebounce(query, 400);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }
    setParams({ q: debouncedQuery });
    setLoading(true);
    setError(null);
    searchContent(debouncedQuery)
      .then((data) => { setResults(data); setSearched(true); })
      .catch((e) => { setError(e.message); setSearched(true); })
      .finally(() => setLoading(false));
  }, [debouncedQuery]);

  return (
    <div className="pt-24 pb-16 min-h-screen max-w-4xl mx-auto px-4 sm:px-6">
      <h1 className="text-2xl font-black text-white mb-6">Search</h1>

      <div className="relative mb-8">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search movies, shows, anime..."
          autoFocus
          className="w-full bg-dark-700 border border-dark-500 focus:border-brand-500 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-gray-500 text-base outline-none transition-colors"
        />
        {loading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 border-dark-500 border-t-brand-500 animate-spin" />
        )}
      </div>

      {error && (
        <div className="text-center py-16">
          <p className="text-gray-400">{error}</p>
        </div>
      )}

      {!error && searched && results.length === 0 && (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-xl font-bold text-white mb-2">No results found</h2>
          <p className="text-gray-400 text-sm">Try a different search term</p>
        </div>
      )}

      {results.length > 0 && (
        <div>
          <p className="text-gray-400 text-sm mb-4">{results.length} result{results.length !== 1 ? 's' : ''} for "{debouncedQuery}"</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {results.map((item) => (
              <ResultCard key={item.slug || item.subject_id || item.name} item={item} />
            ))}
          </div>
        </div>
      )}

      {!searched && !query && (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🎬</div>
          <p className="text-gray-400">Start typing to find movies and shows</p>
        </div>
      )}
    </div>
  );
}
