// Use Netlify proxy to avoid CORS — /proxy/* routes to backend
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || '/proxy';

async function apiFetch(path, options = {}) {
  const url = `${API_BASE_URL}${path}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${url}`);
  return res.json();
}

export { API_BASE_URL, apiFetch };
