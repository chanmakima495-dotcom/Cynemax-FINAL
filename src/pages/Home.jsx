import { useState, useEffect } from 'react';
import { fetchHome } from '../api/home';
import Hero from '../components/Hero';
import MediaRow from '../components/MediaRow';

export default function Home() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error,   setError]     = useState(null);

  useEffect(() => {
    fetchHome()
      .then(setSections)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  // Support both old (section field) and new (title/type field) shapes
  const banner = sections.find(
    s => s.type === 'banner' || s.section === 'Banner' || s.title === 'Featured'
  );
  const rest = sections.filter(s => s !== banner);

  if (error) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center text-center px-4">
        <div>
          <div className="text-5xl mb-4">📡</div>
          <h2 className="text-xl font-bold text-white mb-2">Connection Error</h2>
          <p className="text-gray-400 text-sm mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-brand-500 hover:bg-brand-600 text-white px-5 py-2 rounded-lg text-sm font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-0">
      <Hero items={banner?.items || []} loading={loading} />
      <div className="max-w-7xl mx-auto py-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <MediaRow key={i} title="" items={[]} loading={true} />
            ))
          : rest.map((section, i) => (
              <MediaRow
                key={section.title || section.section || i}
                title={section.title || section.section || ''}
                items={section.items || []}
                loading={false}
              />
            ))}
      </div>
    </div>
  );
}
