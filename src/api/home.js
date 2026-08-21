import { apiFetch } from './client';

const normalize = (v) =>
  Array.isArray(v) ? v : (v?.items || v?.list || v?.data || []);

export async function fetchHome() {
  const data = await apiFetch('/home');
  const sections = [];

  // The API returns {code, data: {list: [{type:"BANNER",items:[]},{type:"SUBJECT_MOVIE",items:[]}]}}
  const list = data?.data?.list || data?.list || data?.sections || [];

  if (Array.isArray(list) && list.length > 0) {
    for (const section of list) {
      const items = normalize(section.items || section.list || section.subjects || []);
      if (!items.length) continue;
      const type  = section.section || section.type || '';
      const isBanner = type.includes('BANNER') || type.includes('banner');
      sections.push({
        title:   isBanner ? 'Featured' : (section.name || section.title || type || 'Popular'),
        type:    isBanner ? 'banner' : 'row',
        items,
      });
    }
    return sections;
  }

  // Flat fallback
  if (Array.isArray(data)) {
    sections.push({ title: 'Popular', type: 'row', items: data });
    return sections;
  }

  // Key-based fallback
  const keys = ['trending','recommend','popular','movies','items','subjects','results'];
  for (const key of keys) {
    if (Array.isArray(data?.[key]) && data[key].length > 0) {
      sections.push({ title: key.charAt(0).toUpperCase()+key.slice(1), type: 'row', items: data[key] });
    }
  }

  return sections;
}
