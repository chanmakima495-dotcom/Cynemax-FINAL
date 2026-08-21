import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';

const PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQ1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQ1MCIgZmlsbD0iIzFjMjUzNSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSI0OCIgZmlsbD0iIzM3NGQ2OCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuKZoTwvdGV4dD48L3N2Zz4=';

export default function MediaCard({ item, size = 'md' }) {
  const [imgError, setImgError] = useState(false);

  const slug =
    item.subjectId   ||
    item.subject_id  ||
    item.id          ||
    item.movieId     ||
    item.slug        ||
    item.detailPath  ||
    item.detail_path || '';

  // API uses cover.url or cover (string) or poster
  const rawCover =
    item.cover?.url  ||
    (typeof item.cover === 'string' ? item.cover : null) ||
    item.poster       ||
    item.poster_url   ||
    item.thumbnail    ||
    item.image        || '';

  const poster = imgError || !rawCover ? PLACEHOLDER : rawCover;

  const title = item.title || item.name || '';

  // API uses score field
  const rawRating = item.score || item.imdbRatingValue || item.rating || item.imdb_rating;
  const rating = rawRating && !isNaN(parseFloat(rawRating))
    ? parseFloat(rawRating).toFixed(1) : null;

  const year =
    item.year ||
    item.releaseTime?.slice(0, 4) ||
    item.releaseDate?.slice(0, 4) || null;

  const widthClass = {
    sm: 'w-28 sm:w-32',
    md: 'w-36 sm:w-40 md:w-44',
    lg: 'w-40 sm:w-48 md:w-52',
  }[size] || 'w-36 sm:w-40 md:w-44';

  if (!slug) return null;

  return (
    <Link
      to={`/detail/${encodeURIComponent(slug)}`}
      className={`${widthClass} shrink-0 group cursor-pointer`}
    >
      <div className="relative rounded-xl overflow-hidden aspect-[2/3] bg-dark-700 shadow-lg transition-transform duration-300 group-hover:-translate-y-1 group-hover:shadow-2xl group-hover:shadow-brand-500/10">
        <img
          src={poster}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          onError={() => setImgError(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {rating && (
          <div className="absolute top-2 right-2 flex items-center gap-0.5 bg-black/60 backdrop-blur-sm rounded px-1.5 py-0.5">
            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
            <span className="text-xs font-semibold text-white">{rating}</span>
          </div>
        )}

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
            <svg className="w-5 h-5 text-dark-900 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="mt-2 px-0.5">
        <p className="text-sm font-medium text-white truncate group-hover:text-brand-400 transition-colors">
          {title}
        </p>
        {year && <p className="text-xs text-gray-500 mt-0.5">{year}</p>}
      </div>
    </Link>
  );
}
