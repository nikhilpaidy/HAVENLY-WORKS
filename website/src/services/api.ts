const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:6018/api/v1';

export function getMediaUrl(url?: string): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const origin = API_BASE_URL.replace(/\/api\/v1\/?$/, '');
  return `${origin}${url.startsWith('/') ? '' : '/'}${url}`;
}

export interface BlogPostItem {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImageUrl?: string;
  author: {
    name: string;
    role: string;
    avatarUrl?: string;
  };
  categories: string[];
  tags: string[];
  status: string;
  readTimeMinutes: number;
  publishedAt: string;
  createdAt: string;
}

export async function getPublishedBlogs(params?: { category?: string; search?: string }): Promise<BlogPostItem[]> {
  try {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.search) query.append('search', params.search);

    const res = await fetch(`${API_BASE_URL}/blogs?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch blogs');
    const json = await res.json();
    return json.data || [];
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return [];
  }
}

export async function getBlogBySlug(slug: string): Promise<BlogPostItem | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/blogs/slug/${slug}`);
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return null;
  }
}
