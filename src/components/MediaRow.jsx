import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MediaCard from './MediaCard';
import SkeletonCard from './SkeletonCard';

export default function MediaRow({ title, items, loading, size = 'md' }) {
  const scrollRef = useRef(null);

  function scroll(dir) {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.7;
    el.scrollBy({ left: dir === 'right' ? amount : -amount, behavior: 'smooth' });
  }

  return (
    <section className="py-4">
      <div className="flex items-center justify-between mb-4 px-4 sm:px-6">
        <h2 className="text-lg sm:text-xl font-bold text-white">{title}</h2>
        <div className="flex gap-1">
          <button
            onClick={() => scroll('left')}
            className="w-8 h-8 rounded-full bg-dark-700 hover:bg-dark-500 flex items-center justify-center text-gray-300 hover:text-white transition-colors"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="w-8 h-8 rounded-full bg-dark-700 hover:bg-dark-500 flex items-center justify-center text-gray-300 hover:text-white transition-colors"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto scrollbar-hide px-4 sm:px-6 pb-2"
      >
        {loading
          ? Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} size={size} />)
          : (items || []).map((item) => (
              <MediaCard key={item.subject_id || item.subjectId || item.slug || item.name} item={item} size={size} />
            ))}
      </div>
    </section>
  );
}
