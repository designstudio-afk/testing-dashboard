import { ProjectCategory } from '../types/news';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

function authHeader(token: string) {
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

export async function fetchProjectCategoriesList(token: string): Promise<ProjectCategory[]> {
  const res = await fetch(`${BASE_URL}/api/categories`, {
    headers: authHeader(token),
  });
  if (!res.ok) throw new Error('Failed to fetch project categories');
  const data = await res.json();
  return Array.isArray(data) ? data : data.data ?? [];
}

export async function createProjectCategory(token: string, category_name: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/categories`, {
    method: 'POST',
    headers: authHeader(token),
    body: JSON.stringify({ category_name }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to create project category');
  }
}

export async function updateProjectCategory(token: string, id: string, category_name: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/categories/${id}`, {
    method: 'PUT',
    headers: authHeader(token),
    body: JSON.stringify({ category_name }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to update project category');
  }
}

export async function deleteProjectCategory(token: string, id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/categories/${id}`, {
    method: 'DELETE',
    headers: authHeader(token),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to delete project category');
  }
}
