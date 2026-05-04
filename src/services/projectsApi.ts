import { ProjectsListResponse, ProjectCategory, ProjectSubCategory } from '../types/news';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` };
}

export async function fetchProjects(token: string, page = 1, limit = 6): Promise<ProjectsListResponse> {
  const res = await fetch(`${BASE_URL}/api/projects?page=${page}&limit=${limit}`, {
    headers: authHeader(token),
  });
  if (!res.ok) throw new Error('Failed to fetch projects');
  return res.json();
}

export async function searchProjects(token: string, q: string): Promise<ProjectsListResponse> {
  const res = await fetch(`${BASE_URL}/api/projects/search?q=${encodeURIComponent(q)}`, {
    headers: authHeader(token),
  });
  if (!res.ok) throw new Error('Failed to search projects');
  return res.json();
}

export async function fetchProjectCategories(token: string): Promise<ProjectCategory[]> {
  const res = await fetch(`${BASE_URL}/api/categories`, {
    headers: authHeader(token),
  });
  if (!res.ok) throw new Error('Failed to fetch categories');
  const data = await res.json();
  return Array.isArray(data) ? data : data.data ?? [];
}

export async function fetchProjectSubCategories(token: string): Promise<ProjectSubCategory[]> {
  const res = await fetch(`${BASE_URL}/api/sub-categories`, {
    headers: authHeader(token),
  });
  if (!res.ok) throw new Error('Failed to fetch sub-categories');
  const data = await res.json();
  return Array.isArray(data) ? data : data.data ?? [];
}

export async function createProject(token: string, formData: FormData): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/projects`, {
    method: 'POST',
    headers: authHeader(token),
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to create project');
  }
}

export async function updateProject(token: string, id: string, formData: FormData): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/projects/${id}`, {
    method: 'PUT',
    headers: authHeader(token),
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to update project');
  }
}

export async function deleteProject(token: string, id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/projects/${id}`, {
    method: 'DELETE',
    headers: authHeader(token),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to delete project');
  }
}
