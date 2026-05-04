export interface NewsItem {
  id: string;
  images: string;
  title: string;
  date: string;
  category_id: string;
  link: string;
  created_at: string;
  updated_at: string;
  category_name: string;
}

export interface NewsCategory {
  id: string;
  category_name: string;
}

export interface NewsPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface NewsListResponse {
  success: boolean;
  data: NewsItem[];
  pagination: NewsPagination;
}

export interface Project {
  id: string;
  category_id: string;
  cover: string;
  slug: string;
  title: string;
  layout: string;
  location_date: string;
  architect: string;
  type: string;
  size: string;
  status: string;
  desc: string;
  images1: string | null;
  images2: string | null;
  images3: string | null;
  images4: string | null;
  images5: string | null;
  images6: string | null;
  images7: string | null;
  images8: string | null;
  images9: string | null;
  images10: string | null;
  created_at: string;
  updated_at: string;
  cat1: string | null;
  cat2: string | null;
  category_name: string;
  sub_categories: { id: string; sub_category_name: string }[];
}

export interface ProjectsListResponse {
  success: boolean;
  data: Project[];
  pagination: NewsPagination;
}

export interface NewsFormInput {
  title: string;
  date: string;
  category_id: string;
  link: string;
  images: File | null;
}

export interface ProjectCategory {
  id: string;
  category_name: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectSubCategory {
  id: string;
  category_id: string | null;
  sub_category_name: string;
  created_at: string;
  updated_at: string;
}
