import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, Info, ChevronLeft, ChevronRight, Star } from 'lucide-react';

export default function Hero({ items = [] }) {
  const [current, setCurrent] = useState(0);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (items.length < 2) return;
    const id = setInterval(() => {
      setCurrent((p) => (p + 1) % items.length);
      setImgError(false);
    }, 6000);
    return () => clearInterval(id);
  }, [items.length]);

  if (!items.length) return (
    <div className="h-[60vh] sm:h-[75vh] bg-dark-800 skeleton" />
  );

  const item = items[current];
  const slug = item.slug || item.detailPath;
  const poster = imgError ? null : item.poster_url;

  return (
    <div className="relative h-[60vh] sm:h-[75vh] overflow-hidden bg-dark-800">
      {/* Background */}
      {poster ? (
        <img
          key={slug}
          src={poster}
          alt={item.name}
          className="absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-700"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-dark-700 to-dark-900" />
      )}

      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-dark-900 via-dark-900/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-transparent to-dark-900/30" />

      {/* Content */}
      <div className="absolute inset-0 flex items-end sm:items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full pb-16 sm:pb-0 animate-slide-up">
          <div className="max-w-xl">
            {item.badge && (
              <span className="inline-block bg-brand-500 text-white text-xs font-bold px-3 py-1 rounded mb-3 uppercase tracking-wider">
                {item.badge}
              </span>
            )}
            <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight mb-3 drop-shadow-2xl">
              {item.name}
            </h1>
            {item.rating && (
              <div className="flex items-center gap-1.5 mb-4">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="text-yellow-400 font-bold">{parseFloat(item.rating).toFixed(1)}</span>
                <span className="text-gray-400 text-sm">/ 10</span>
              </div>
            )}
            <div className="flex gap-3 flex-wrap">
              <Link
                to={`/detail/${slug}`}
                className="flex items-center gap-2 bg-white text-dark-900 hover:bg-gray-100 font-bold px-5 py-2.5 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 text-sm"
              >
                <Play className="w-4 h-4 fill-current" /> Watch Now
              </Link>
              <Link
                to={`/detail/${slug}`}
                className="flex items-center gap-2 glass text-white hover:bg-white/20 font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 text-sm border-0"
              >
                <Info className="w-4 h-4" /> More Info
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      {items.length > 1 && (
        <>
          <button
            onClick={() => { setCurrent((p) => (p - 1 + items.length) % items.length); setImgError(false); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 glass rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            aria-label="Previous"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => { setCurrent((p) => (p + 1) % items.length); setImgError(false); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 glass rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            aria-label="Next"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => { setCurrent(i); setImgError(false); }}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === current ? 'w-6 bg-brand-400' : 'w-1.5 bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
