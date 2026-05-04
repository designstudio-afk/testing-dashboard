import { useState, useEffect, useCallback, useRef } from 'react';
import { Loader2, AlertCircle, ChevronLeft, ChevronRight, MapPin, Ruler, CheckCircle, FolderOpen, Search, X, Plus } from 'lucide-react';
import { Project } from '../../types/news';
import { fetchProjects, searchProjects, deleteProject } from '../../services/projectsApi';
import { useAuth } from '../../context/AuthContext';
import ProjectModal from './ProjectModal';

const STATUS_COLORS: Record<string, string> = {
  Completed: 'bg-emerald-500/15 text-emerald-400',
  'In Progress': 'bg-amber-500/15 text-amber-400',
  Ongoing: 'bg-amber-500/15 text-amber-400',
  Planning: 'bg-blue-500/15 text-blue-400',
};

function statusClass(status: string) {
  return STATUS_COLORS[status] ?? 'bg-slate-500/15 text-slate-400';
}

export default function ProjectsView() {
  const { token } = useAuth();
  const [items, setItems] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Project | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(query.trim());
      setPage(1);
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const load = useCallback(async (p = 1, q = '') => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const res = q ? await searchProjects(token, q) : await fetchProjects(token, p, 6);
      setItems(res.data);
      setTotalPages(res.pagination?.totalPages ?? 1);
      setTotal(res.pagination?.total ?? res.data.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load(page, debouncedQuery);
  }, [load, page, debouncedQuery]);

  const handleDelete = async (id: string) => {
    if (!token) return;
    await deleteProject(token, id);
    load(page, debouncedQuery);
  };

  const isSearching = debouncedQuery.length > 0;

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Projects</h2>
          <p className="text-slate-400 text-sm mt-0.5">
            {isSearching
              ? `${total} result${total !== 1 ? 's' : ''} for "${debouncedQuery}"`
              : `${total} project${total !== 1 ? 's' : ''} total`}
          </p>
        </div>
        <button
          onClick={() => { setEditItem(null); setModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-blue-500 hover:bg-blue-600 text-white transition-all flex-shrink-0"
        >
          <Plus size={15} />
          Add Project
        </button>
      </div>

      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search projects..."
          className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl pl-9 pr-9 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2.5 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          <AlertCircle size={15} className="text-red-400 flex-shrink-0" />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-32">
          <Loader2 size={24} className="animate-spin text-slate-500" />
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center bg-slate-800/60 border border-slate-700/50 rounded-xl">
          <FolderOpen size={28} className="text-slate-600 mb-3" />
          <p className="text-slate-400 font-medium">
            {isSearching ? `No results for "${debouncedQuery}"` : 'No projects found'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={() => { setEditItem(project); setModalOpen(true); }}
            />
          ))}
        </div>
      )}

      {!isSearching && totalPages > 1 && (
        <div className="flex items-center justify-between pt-1">
          <p className="text-slate-500 text-sm">Page {page} of {totalPages}</p>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {modalOpen && (
        <ProjectModal
          item={editItem}
          onClose={() => { setModalOpen(false); setEditItem(null); }}
          onSaved={() => load(page, debouncedQuery)}
          onDelete={editItem ? handleDelete : undefined}
        />
      )}
    </div>
  );
}

function ProjectCard({ project, onClick }: { project: Project; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="group cursor-pointer bg-slate-800/60 border border-slate-700/50 rounded-xl overflow-hidden hover:border-slate-600 hover:bg-slate-800/80 transition-all duration-200"
    >
      <div className="relative aspect-video overflow-hidden bg-slate-900">
        {project.cover ? (
          <img
            src={project.cover}
            alt={project.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FolderOpen size={24} className="text-slate-700" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
        <div className="absolute top-2.5 right-2.5">
          <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${statusClass(project.status)}`}>
            <CheckCircle size={10} />
            {project.status}
          </span>
        </div>
        <div className="absolute bottom-2.5 left-3">
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-white/10 text-white backdrop-blur-sm">
            {project.category_name}
          </span>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div>
          <h3 className="text-slate-100 font-semibold text-sm leading-snug line-clamp-2">{project.title}</h3>
          <p className="text-slate-500 text-xs mt-1 font-mono">{project.type}</p>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-400">
          {project.location_date && (
            <span className="flex items-center gap-1 min-w-0">
              <MapPin size={11} className="flex-shrink-0 text-slate-500" />
              <span className="truncate">{project.location_date}</span>
            </span>
          )}
          {project.size && (
            <span className="flex items-center gap-1 flex-shrink-0">
              <Ruler size={11} className="text-slate-500" />
              {project.size}
            </span>
          )}
        </div>

        {project.cat2 && (
          <p className="text-slate-500 text-xs truncate">
            <span className="text-slate-600">Team: </span>{project.cat2}
          </p>
        )}
      </div>
    </div>
  );
}
