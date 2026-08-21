import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, ChevronDown } from 'lucide-react';
import { fetchHome } from '../api/home';

const PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQ1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQ1MCIgZmlsbD0iIzFjMjUzNSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSI0OCIgZmlsbD0iIzM3NGQ2OCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuKZoTwvdGV4dD48L3N2Zz4=';

function GridCard({ item }) {
  const [imgErr, setImgErr] = useState(false);
  const slug = item.slug || item.detailPath;
  const rating = item.rating ? parseFloat(item.rating).toFixed(1) : null;

  return (
    <Link to={`/detail/${slug}`} className="group">
      <div className="relative rounded-xl overflow-hidden aspect-[2/3] bg-dark-700 border border-dark-600 group-hover:border-dark-500 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl group-hover:shadow-black/40">
        <img
          src={imgErr ? PLACEHOLDER : (item.poster_url || PLACEHOLDER)}
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          onError={() => setImgErr(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        {rating && (
          <div className="absolute top-2 right-2 flex items-center gap-0.5 bg-black/70 backdrop-blur-sm rounded px-1.5 py-0.5">
            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
            <span className="text-xs font-semibold text-white">{rating}</span>
          </div>
        )}
        {item.badge && (
          <div className="absolute top-2 left-2">
            <span className="bg-brand-500 text-white text-xs font-semibold px-1.5 py-0.5 rounded">{item.badge}</span>
          </div>
        )}
      </div>
      <p className="mt-2 text-sm font-medium text-gray-300 group-hover:text-white truncate transition-colors">{item.name}</p>
    </Link>
  );
}

export default function Movies() {
  const [allItems, setAllItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHome()
      .then((sections) => {
        const movieSections = ['Popular Movie', 'Action Movies', 'Horror Movies', 'Banner'];
        const seen = new Set();
        const items = [];
        sections
          .filter(s => movieSections.some(ms => s.section.includes('Movie') || s.section.includes('Movies') || s.section === 'Horror Movies'))
          .forEach(s => {
            (s.items || []).forEach(item => {
              if (!seen.has(item.slug)) { seen.add(item.slug); items.push(item); }
            });
          });
        // Also pull Popular Movie + Action Movies specifically
        sections.filter(s => ['Popular Movie', 'Action Movies', 'Horror Movies'].includes(s.section))
          .forEach(s => {
            (s.items || []).forEach(item => {
              if (!seen.has(item.slug)) { seen.add(item.slug); items.push(item); }
            });
          });
        setAllItems(items);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="pt-24 pb-16 max-w-7xl mx-auto px-4 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white mb-1">Movies</h1>
        <p className="text-gray-400 text-sm">{allItems.length > 0 ? `${allItems.length} titles` : 'Browse all movies'}</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3 sm:gap-4">
          {Array.from({ length: 28 }).map((_, i) => (
            <div key={i}>
              <div className="skeleton rounded-xl aspect-[2/3]" />
              <div className="skeleton h-3 rounded mt-2 w-3/4" />
            </div>
          ))}
        </div>
      ) : allItems.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🎬</div>
          <p className="text-gray-400">No movies available right now</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3 sm:gap-4">
          {allItems.map(item => <GridCard key={item.slug || item.subject_id} item={item} />)}
        </div>
      )}
    </div>
  );
}
