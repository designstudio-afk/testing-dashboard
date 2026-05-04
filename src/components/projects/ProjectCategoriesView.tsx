import { useState, useEffect, useCallback, FormEvent } from 'react';
import { Plus, Pencil, Loader2, AlertCircle, Layers, X } from 'lucide-react';
import { ProjectCategory } from '../../types/news';
import {
  fetchProjectCategoriesList,
  createProjectCategory,
  updateProjectCategory,
} from '../../services/projectCategoriesApi';
import { useAuth } from '../../context/AuthContext';

export default function ProjectCategoriesView() {
  const { token } = useAuth();
  const [items, setItems] = useState<ProjectCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<ProjectCategory | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const data = await fetchProjectCategoriesList(token);
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (name: string) => {
    await createProjectCategory(token!, name);
    await load();
  };

  const handleUpdate = async (name: string) => {
    await updateProjectCategory(token!, editItem!.id, name);
    await load();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Project Categories</h2>
          <p className="text-slate-400 text-sm mt-0.5">
            {items.length} categor{items.length !== 1 ? 'ies' : 'y'} total
          </p>
        </div>
        <button
          onClick={() => { setEditItem(null); setModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-blue-500 hover:bg-blue-600 text-white transition-all shadow-lg shadow-blue-500/20"
        >
          <Plus size={16} />
          Add Category
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          <AlertCircle size={15} className="text-red-400 flex-shrink-0" />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-slate-500" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Layers size={28} className="text-slate-600 mb-3" />
            <p className="text-slate-400 font-medium">No categories yet</p>
            <p className="text-slate-600 text-sm mt-1">Click "Add Category" to create the first one.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">#</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Category Name</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">ID</th>
                <th className="px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {items.map((item, idx) => (
                <tr key={item.id} className="hover:bg-white/2 transition-colors">
                  <td className="px-5 py-4">
                    <span className="text-slate-500 text-sm">{idx + 1}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2.5">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-blue-500/15">
                        <Layers size={13} className="text-blue-400" />
                      </span>
                      <span className="text-slate-200 text-sm font-medium">{item.category_name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-slate-500 text-xs font-mono">{item.id}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end">
                      <button
                        onClick={() => { setEditItem(item); setModalOpen(true); }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all"
                        title="Edit"
                      >
                        <Pencil size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalOpen && (
        <CategoryModal
          item={editItem}
          onClose={() => { setModalOpen(false); setEditItem(null); }}
          onSubmit={editItem ? handleUpdate : handleCreate}
        />
      )}
    </div>
  );
}

function CategoryModal({
  item,
  onClose,
  onSubmit,
}: {
  item: ProjectCategory | null;
  onClose: () => void;
  onSubmit: (name: string) => Promise<void>;
}) {
  const [name, setName] = useState(item?.category_name ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onSubmit(name.trim());
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h2 className="text-white font-semibold text-base">
            {item ? 'Edit Category' : 'Add Category'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 transition-colors">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Category Name</label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Residential"
              className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          {error && (
            <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3.5 py-2.5">
              {error}
            </p>
          )}
          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              {item ? 'Save changes' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
