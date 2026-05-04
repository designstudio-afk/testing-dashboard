import { NewsCategory, NewsFormInput, NewsListResponse } from '../types/news';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` };
}

export async function fetchNews(token: string, page = 1, limit = 10): Promise<NewsListResponse> {
  const res = await fetch(`${BASE_URL}/api/news?page=${page}&limit=${limit}`, {
    headers: authHeader(token),
  });
  if (!res.ok) throw new Error('Failed to fetch news');
  return res.json();
}

export async function fetchCategories(token: string): Promise<NewsCategory[]> {
  const res = await fetch(`${BASE_URL}/api/news-categories`, {
    headers: authHeader(token),
  });
  if (!res.ok) throw new Error('Failed to fetch categories');
  const data = await res.json();
  return Array.isArray(data) ? data : data.data ?? [];
}

function buildFormData(input: NewsFormInput): FormData {
  const fd = new FormData();
  fd.append('title', input.title);
  fd.append('date', input.date);
  fd.append('category_id', input.category_id);
  fd.append('link', input.link);
  if (input.images) fd.append('images', input.images);
  return fd;
}

export async function createNews(token: string, input: NewsFormInput): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/news`, {
    method: 'POST',
    headers: authHeader(token),
    body: buildFormData(input),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to create news');
  }
}

export async function updateNews(token: string, id: string, input: NewsFormInput): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/news/${id}`, {
    method: 'PUT',
    headers: authHeader(token),
    body: buildFormData(input),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to update news');
  }
}

export async function deleteNews(token: string, id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/news/${id}`, {
    method: 'DELETE',
    headers: authHeader(token),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to delete news');
  }
}
