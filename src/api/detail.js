import { apiFetch } from './client';

function normalizeSubject(raw) {
  if (!raw) return null;
  const s = raw.subject || raw;
  const resource = raw.resource || {};
  return {
    subject: {
      subjectId:       s.subjectId || s.id || s.subject_id,
      title:           s.title || s.name,
      cover: {
        url: s.cover?.url || (typeof s.cover === 'string' ? s.cover : null)
          || s.poster || s.thumbnail || s.image || '',
      },
      imdbRatingValue: s.imdbRatingValue || s.score || s.rating || s.imdb_rating,
      releaseDate:     s.releaseDate || s.releaseTime || s.release_date
        || (s.year ? `${s.year}-01-01` : ''),
      countryName:     s.countryName || s.country,
      description:     s.description || s.overview || s.plot || s.intro,
      genre:           s.genre || (Array.isArray(s.genres) ? s.genres.join(', ') : ''),
      subtitles:       s.subtitles,
      trailer: {
        dubs: s.trailer?.dubs || s.dubs || s.audios || raw.dubs || [],
      },
    },
    stars:    raw.stars || raw.cast || [],
    resource: {
      seasons: resource.seasons || raw.seasons
        || (raw.resource?.seasons) || [],
    },
  };
}

export async function fetchDetail(slugOrId) {
  const id = decodeURIComponent(String(slugOrId)).replace(/^\//, '');
  const data = await apiFetch(`/detail/${id}`);
  // API: {code,data:{subject:{...},resource:{seasons:[]},stars:[]}}
  const inner = data?.data || data?.result || data;
  return normalizeSubject(inner);
}

export async function fetchEpisodes(seriesId, season = 1) {
  try {
    const data = await apiFetch(`/episodes/${seriesId}?season=${season}`);
    const inner = data?.data || data;
    return Array.isArray(inner) ? inner
      : (inner?.episodes || inner?.items || inner?.list || []);
  } catch { return []; }
}

function extractStreamUrl(raw) {
  if (!raw) return null;
  // mediaUrl / url / stream
  const direct = raw.mediaUrl || raw.streamUrl || raw.playUrl || raw.url || raw.stream_url;
  if (direct && typeof direct === 'string' && direct.startsWith('http')) {
    return { url: direct, type: direct.includes('.m3u8') ? 'hls' : 'mp4' };
  }
  // embed
  if (raw.embed || raw.iframe) return { url: raw.embed || raw.iframe, type: 'embed' };
  // sources array
  const list = raw.sources || raw.mediaList || raw.hls || raw.qualities;
  if (Array.isArray(list) && list.length > 0) {
    const sorted = [...list].sort((a,b) =>
      (b.quality||b.resolution||0)-(a.quality||a.resolution||0));
    const best = sorted[0];
    const url = best.url || best.src || best.link || best.mediaUrl;
    if (url) return { url, type: url.includes('.m3u8')?'hls':'mp4', quality: best.quality };
  }
  return null;
}

export async function fetchStream(subjectId, detailPath, season = 1, ep = 1) {
  const id = subjectId
    || decodeURIComponent(String(detailPath||'').replace(/^\//, ''));
  if (!id) throw new Error('No subject ID');

  const data = await apiFetch(`/stream/${id}?se=${season}&ep=${ep}`);
  const raw  = data?.data || data?.result || data;

  if (!raw) throw new Error('No stream data.');

  const result = extractStreamUrl(raw);
  if (result) return { ...result, raw };

  // Check nested
  if (raw.mediaInfo) {
    const r2 = extractStreamUrl(raw.mediaInfo);
    if (r2) return { ...r2, raw };
  }

  throw new Error(raw.note || raw.message || 'No stream found for this episode.');
}

export async function fetchCaptions(subjectId, detailPath, season = 1, ep = 1) {
  try {
    const id = subjectId
      || decodeURIComponent(String(detailPath||'').replace(/^\//, ''));
    const data = await apiFetch(`/subtitles/${id}?se=${season}&ep=${ep}`);
    const inner = data?.data || data;
    return Array.isArray(inner) ? inner
      : (inner?.captions || inner?.subtitles || inner?.list || []);
  } catch { return []; }
}
