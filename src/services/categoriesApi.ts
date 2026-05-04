import { NewsCategory } from '../types/news';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

function authHeader(token: string) {
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

export async function fetchCategoriesList(token: string): Promise<NewsCategory[]> {
  const res = await fetch(`${BASE_URL}/api/news-categories`, {
    headers: authHeader(token),
  });
  if (!res.ok) throw new Error('Failed to fetch categories');
  const data = await res.json();
  return Array.isArray(data) ? data : data.data ?? [];
}

export async function createCategory(token: string, category_name: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/news-categories`, {
    method: 'POST',
    headers: authHeader(token),
    body: JSON.stringify({ category_name }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to create category');
  }
}

export async function updateCategory(token: string, id: string, category_name: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/news-categories/${id}`, {
    method: 'PUT',
    headers: authHeader(token),
    body: JSON.stringify({ category_name }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to update category');
  }
}
