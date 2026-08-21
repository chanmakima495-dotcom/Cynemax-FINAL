import { apiFetch } from './client';

export async function searchContent(query) {
  if (!query?.trim()) return [];
  const data = await apiFetch(`/search?q=${encodeURIComponent(query.trim())}`);
  return Array.isArray(data) ? data
    : (data.results || data.items || data.data || data.subjects || []);
}
