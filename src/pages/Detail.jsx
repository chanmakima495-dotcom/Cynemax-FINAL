import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Play, Star, Calendar, Globe, Film, ChevronDown } from 'lucide-react';
import { fetchDetail } from '../api/detail';

const PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQ1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQ1MCIgZmlsbD0iIzFjMjUzNSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSI0OCIgZmlsbD0iIzM3NGQ2OCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuKZoTwvdGV4dD48L3N2Zz4=';

function SkeletonDetail() {
  return (
    <div className="pt-0 animate-fade-in">
      <div className="skeleton h-[40vh] sm:h-[55vh] w-full" />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 flex gap-6">
        <div className="skeleton w-36 h-52 rounded-xl shrink-0 hidden sm:block" />
        <div className="flex-1 flex flex-col gap-3">
          <div className="skeleton h-8 rounded w-2/3" />
          <div className="skeleton h-4 rounded w-1/3" />
          <div className="skeleton h-20 rounded w-full mt-2" />
        </div>
      </div>
    </div>
  );
}

export default function Detail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imgErr, setImgErr] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedDub, setSelectedDub] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchDetail(slug)
      .then((d) => {
        setData(d);
        if (d?.subject?.trailer?.dubs?.length) {
          const defaultDub = d.subject.trailer.dubs.find(dub => dub.original) || d.subject.trailer.dubs[0];
          setSelectedDub(defaultDub);
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <SkeletonDetail />;

  if (error || !data) {
    return (
      <div className="pt-24 min-h-screen flex items-center justify-center text-center px-4">
        <div>
          <div className="text-5xl mb-4">🎬</div>
          <h2 className="text-xl font-bold text-white mb-2">Content Not Found</h2>
          <p className="text-gray-400 text-sm mb-4">{error || 'This title could not be loaded.'}</p>
          <button onClick={() => navigate(-1)} className="bg-brand-500 hover:bg-brand-600 text-white px-5 py-2 rounded-lg text-sm font-medium">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const { subject, stars = [], resource } = data;
  const trailer = subject?.trailer;
  const poster = imgErr ? PLACEHOLDER : (subject?.cover?.url || PLACEHOLDER);
  const genres = subject?.genre?.split(',').map(g => g.trim()).filter(Boolean) || [];
  const seasons = resource?.seasons || [];
  const dubs = trailer?.dubs || [];
  const currentDub = selectedDub || dubs[0];
  const watchSubjectId = currentDub?.subjectId || subject?.subjectId;
  const watchSlug = currentDub?.detailPath || slug;

  function handleWatch(ep = 1) {
    if (!watchSubjectId) return;
    navigate(`/watch/${watchSubjectId}?detail_path=${encodeURIComponent(watchSlug)}&season=${selectedSeason}&ep=${ep}`);
  }

  const currentSeason = seasons.find(s => s.se === selectedSeason);
  const epCount = currentSeason?.maxEp || 0;

  return (
    <div className="animate-fade-in">
      {/* Backdrop */}
      <div className="relative h-[45vh] sm:h-[55vh] overflow-hidden bg-dark-800">
        <img
          src={poster}
          alt={subject?.title}
          className="w-full h-full object-cover object-top blur-sm scale-105 opacity-40"
          onError={() => setImgErr(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/50 to-dark-900/20" />
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-40 relative z-10 pb-20">
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          {/* Poster */}
          <div className="w-36 sm:w-52 shrink-0 rounded-2xl overflow-hidden shadow-2xl shadow-black/60 border border-dark-600 hidden sm:block">
            <img
              src={poster}
              alt={subject?.title}
              className="w-full aspect-[2/3] object-cover"
              onError={() => setImgErr(true)}
            />
          </div>

          {/* Info */}
          <div className="flex-1 pt-2 sm:pt-10">
            <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight mb-3">
              {subject?.title}
            </h1>

            <div className="flex flex-wrap gap-3 text-sm text-gray-400 mb-4">
              {subject?.imdbRatingValue && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-yellow-400 font-bold">{subject.imdbRatingValue}</span>
                  <span>/10 IMDB</span>
                </div>
              )}
              {subject?.releaseDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{subject.releaseDate.slice(0, 4)}</span>
                </div>
              )}
              {subject?.countryName && (
                <div className="flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5" />
                  <span>{subject.countryName}</span>
                </div>
              )}
              {subject?.subtitles && (
                <div className="flex items-center gap-1">
                  <Film className="w-3.5 h-3.5" />
                  <span>Sub: {subject.subtitles}</span>
                </div>
              )}
            </div>

            {genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {genres.map(g => (
                  <span key={g} className="bg-dark-700 text-gray-300 text-xs font-medium px-3 py-1 rounded-full border border-dark-600">
                    {g}
                  </span>
                ))}
              </div>
            )}

            {subject?.description && (
              <p className="text-gray-300 text-sm leading-relaxed mb-6 line-clamp-3">
                {subject.description}
              </p>
            )}

            {/* Dub selector */}
            {dubs.length > 1 && (
              <div className="mb-4">
                <label className="text-xs text-gray-500 font-medium uppercase tracking-wider block mb-2">Audio / Language</label>
                <div className="flex flex-wrap gap-2">
                  {dubs.map(dub => (
                    <button
                      key={dub.subjectId}
                      onClick={() => setSelectedDub(dub)}
                      className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-all ${
                        currentDub?.subjectId === dub.subjectId
                          ? 'bg-brand-500 border-brand-500 text-white'
                          : 'bg-dark-700 border-dark-600 text-gray-300 hover:border-gray-500'
                      }`}
                    >
                      {dub.lanName}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Watch button */}
            <button
              onClick={() => handleWatch(1)}
              className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-bold px-7 py-3 rounded-xl transition-all duration-200 hover:scale-105 shadow-lg shadow-brand-500/25 text-sm"
            >
              <Play className="w-4 h-4 fill-white" /> Watch Now
            </button>
          </div>
        </div>

        {/* Seasons & Episodes */}
        {seasons.length > 0 && (
          <div className="mt-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Episodes</h2>
              {seasons.length > 1 && (
                <div className="relative">
                  <select
                    value={selectedSeason}
                    onChange={(e) => setSelectedSeason(Number(e.target.value))}
                    className="appearance-none bg-dark-700 border border-dark-600 text-white text-sm rounded-lg px-4 py-2 pr-8 outline-none focus:border-brand-500 cursor-pointer"
                  >
                    {seasons.map(s => (
                      <option key={s.se} value={s.se}>Season {s.se}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              )}
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
              {Array.from({ length: epCount }).map((_, i) => {
                const ep = i + 1;
                return (
                  <button
                    key={ep}
                    onClick={() => handleWatch(ep)}
                    className="bg-dark-700 hover:bg-brand-500 border border-dark-600 hover:border-brand-500 text-gray-300 hover:text-white rounded-lg py-2 text-sm font-medium transition-all duration-200"
                  >
                    {ep}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Cast */}
        {stars.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-bold text-white mb-4">Cast</h2>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
              {[...new Map(stars.map(s => [s.staffId, s])).values()].slice(0, 12).map(star => (
                <div key={star.staffId} className="shrink-0 text-center w-20">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-dark-700 mx-auto border-2 border-dark-600">
                    {star.avatarUrl ? (
                      <img src={star.avatarUrl} alt={star.name} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">👤</div>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-1.5 line-clamp-2 leading-tight">{star.name}</p>
                  {star.character && <p className="text-xs text-gray-600 line-clamp-1">{star.character}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
