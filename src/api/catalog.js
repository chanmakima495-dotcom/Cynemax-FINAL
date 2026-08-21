import { apiFetch } from './client';

const normalize = (data) =>
  Array.isArray(data) ? data
    : (data.results || data.items || data.data || data.subjects || []);

export async function fetchMovies(page = 1) {
  const data = await apiFetch(`/movies?page=${page}`);
  const items = normalize(data);
  return { items, hasMore: items.length >= 20 };
}

export async function fetchTvSeries(page = 1) {
  const data = await apiFetch(`/short-tv?page=${page}`);
  const items = normalize(data);
  return { items, hasMore: items.length >= 20 };
}

export async function fetchTrending(page = 1) {
  const data = await apiFetch(`/trending?page=${page}`);
  const items = normalize(data);
  return { items, hasMore: items.length >= 20 };
}

export async function fetchAnime(page = 1) {
  const data = await apiFetch(`/anime?page=${page}`);
  const items = normalize(data);
  return { items, hasMore: items.length >= 20 };
}
