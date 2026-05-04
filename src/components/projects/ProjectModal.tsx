import { useState, useEffect, useRef, FormEvent } from 'react';
import { X, Loader2, Upload, Image as ImageIcon, Plus, Trash2, AlertTriangle } from 'lucide-react';
import { Project, ProjectCategory, ProjectSubCategory } from '../../types/news';
import {
  fetchProjectCategories,
  fetchProjectSubCategories,
  createProject,
  updateProject,
} from '../../services/projectsApi';
import { useAuth } from '../../context/AuthContext';
import DescEditor from './DescEditor';

interface ProjectModalProps {
  item: Project | null;
  onClose: () => void;
  onSaved: () => void;
  onDelete?: (id: string) => Promise<void>;
}

const MAX_SIZE = 2 * 1024 * 1024;
const LAYOUT_OPTIONS = [
  { value: '1', label: 'Layout 1', example: 'saoarc.com/portfolio/boy-house-tangerang-2023' },
  { value: '2', label: 'Layout 2', example: 'saoarc.com/portfolio/de-residence-redesign-jakarta-2025' },
];
const IMAGE_KEYS = ['images1','images2','images3','images4','images5','images6','images7','images8','images9','images10'] as const;

type ImageKey = typeof IMAGE_KEYS[number];

function FileSlot({
  label,
  existing,
  file,
  onFile,
  onClear,
}: {
  label: string;
  existing?: string | null;
  file: File | null;
  onFile: (f: File) => void;
  onClear: () => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [err, setErr] = useState('');

  const handle = (f: File) => {
    setErr('');
    if (f.size > MAX_SIZE) { setErr('Max 2 MB'); return; }
    onFile(f);
  };

  const preview = file ? URL.createObjectURL(file) : existing ?? null;

  return (
    <div className="relative group">
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handle(f); }}
      />
      {preview ? (
        <div
          onClick={() => ref.current?.click()}
          className="relative cursor-pointer rounded-lg overflow-hidden bg-slate-800 border border-slate-700 hover:border-blue-500/50 transition-colors"
          style={{ aspectRatio: '4/3' }}
        >
          <img src={preview} alt={label} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Upload size={14} className="text-white" />
          </div>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onClear(); }}
            className="absolute top-1 right-1 p-0.5 bg-red-500/80 rounded text-white opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash2 size={10} />
          </button>
        </div>
      ) : (
        <div
          onClick={() => ref.current?.click()}
          className="cursor-pointer rounded-lg border-2 border-dashed border-slate-700 hover:border-blue-500/40 transition-colors flex flex-col items-center justify-center gap-1 bg-slate-800/50"
          style={{ aspectRatio: '4/3' }}
        >
          <Plus size={14} className="text-slate-500" />
          <span className="text-slate-600 text-xs">{label}</span>
          <span className="text-slate-700 text-xs">Max 2 MB</span>
        </div>
      )}
      {err && <p className="text-red-400 text-xs mt-0.5">{err}</p>}
    </div>
  );
}

export default function ProjectModal({ item, onClose, onSaved, onDelete }: ProjectModalProps) {
  const { token } = useAuth();
  const coverRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [locationDate, setLocationDate] = useState('');
  const [type, setType] = useState('');
  const [size, setSize] = useState('');
  const [architect, setArchitect] = useState('');
  const [status, setStatus] = useState('');
  const [layout, setLayout] = useState('1');
  const [cat1, setCat1] = useState('');
  const [cat2, setCat2] = useState('');
  const [subCategoryId, setSubCategoryId] = useState<string>('');

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [coverErr, setCoverErr] = useState('');
  const [imageFiles, setImageFiles] = useState<Record<ImageKey, File | null>>({
    images1: null, images2: null, images3: null, images4: null, images5: null,
    images6: null, images7: null, images8: null, images9: null, images10: null,
  });
  const [clearedImages, setClearedImages] = useState<Set<ImageKey>>(new Set());

  const [categories, setCategories] = useState<ProjectCategory[]>([]);
  const [subCategories, setSubCategories] = useState<ProjectSubCategory[]>([]);
  const [catsLoading, setCatsLoading] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const isFormValid =
    title.trim() !== '' &&
    categoryId !== '' &&
    status.trim() !== '' &&
    type.trim() !== '' &&
    size.trim() !== '' &&
    locationDate.trim() !== '' &&
    layout !== '' &&
    subCategoryId !== '';

  useEffect(() => {
    if (!token) return;
    Promise.all([
      fetchProjectCategories(token),
      fetchProjectSubCategories(token),
    ]).then(([cats, subs]) => {
      setCategories(cats);
      setSubCategories(subs);
    }).catch(() => {}).finally(() => setCatsLoading(false));
  }, [token]);

  useEffect(() => {
    if (item) {
      setTitle(item.title);
      setDesc(item.desc ?? '');
      setCategoryId(item.category_id);
      setLocationDate(item.location_date ?? '');
      setType(item.type ?? '');
      setSize(item.size ?? '');
      setArchitect(item.architect ?? '');
      setStatus(item.status ?? '');
      setLayout(item.layout ?? '1');
      setCat1(item.cat1 ?? '');
      setCat2(item.cat2 ?? '');
      setCoverPreview(item.cover ?? '');
      setSubCategoryId(item.sub_categories?.[0]?.id ?? '');
    }
  }, [item]);

  const handleCoverFile = (f: File) => {
    setCoverErr('');
    if (f.size > MAX_SIZE) { setCoverErr('Max 2 MB'); return; }
    setCoverFile(f);
    setCoverPreview(URL.createObjectURL(f));
  };

  const toggleSubCat = (id: string) => {
    setSubCategoryId((prev) => (prev === id ? '' : id));
  };

  const handleDelete = async () => {
    if (!item || !onDelete) return;
    setDeleteLoading(true);
    setDeleteError('');
    try {
      await onDelete(item.id);
      onClose();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete');
      setDeleteLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!coverFile && !item) { setCoverErr('Cover image is required'); return; }
    setError('');
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('title', title);
      fd.append('desc', desc);
      fd.append('category_id', categoryId);
      fd.append('location_date', locationDate);
      fd.append('type', type);
      fd.append('size', size);
      fd.append('architect', architect);
      fd.append('status', status);
      fd.append('layout', layout);
      fd.append('cat1', cat1);
      fd.append('cat2', cat2);
      if (subCategoryId) fd.append('sub_category_ids[]', subCategoryId);
      if (coverFile) fd.append('cover', coverFile);
      IMAGE_KEYS.forEach((key) => {
        if (imageFiles[key]) fd.append(key, imageFiles[key]!);
      });

      if (item) {
        await updateProject(token!, item.id, fd);
      } else {
        await createProject(token!, fd);
      }
      onSaved();
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
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-h-[92vh] flex flex-col">

        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 flex-shrink-0">
          <h2 className="text-white font-semibold text-base">
            {item ? 'Edit Project' : 'Add Project'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto px-6 py-5 space-y-6">

          <Section title="Basic Info">
            <div className="grid grid-cols-1 gap-4">
              <Field label="Title *">
                <input
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Project title"
                  className={inputCls}
                />
              </Field>
              <Field label="Description *">
                <DescEditor value={desc} onChange={setDesc} />
              </Field>
            </div>
          </Section>

          <Section title="Details">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Category *">
                {catsLoading ? (
                  <div className="flex items-center gap-2 h-10"><Loader2 size={14} className="animate-spin text-slate-500" /><span className="text-slate-500 text-xs">Loading...</span></div>
                ) : (
                  <select required value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={selectCls}>
                    <option value="" disabled>Select...</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.category_name}</option>)}
                  </select>
                )}
              </Field>
              <Field label="Status *">
                <input value={status} onChange={(e) => setStatus(e.target.value)} placeholder="e.g. In Progress" className={inputCls} />
              </Field>
              <Field label="Type *">
                <input value={type} onChange={(e) => setType(e.target.value)} placeholder="e.g. Commercial" className={inputCls} />
              </Field>
              <Field label="Size *">
                <input value={size} onChange={(e) => setSize(e.target.value)} placeholder="e.g. 2,500 sqm" className={inputCls} />
              </Field>
              <Field label="Location / Date *">
                <input value={locationDate} onChange={(e) => setLocationDate(e.target.value)} placeholder="e.g. Jakarta, 2024" className={inputCls} />
              </Field>
              <Field label="Architecture + Interior">
                <input value={architect} onChange={(e) => setArchitect(e.target.value)} placeholder="Lead architect" className={inputCls} />
              </Field>
              <Field label="Architect">
                <input value={cat1} onChange={(e) => setCat1(e.target.value)} placeholder="Category label 1" className={inputCls} />
              </Field>
              <Field label="Interior Designer">
                <input value={cat2} onChange={(e) => setCat2(e.target.value)} placeholder="Category label 2" className={inputCls} />
              </Field>
              <div className="col-span-2">
                <Field label="Layout">
                  <div className="grid grid-cols-2 gap-3">
                    {LAYOUT_OPTIONS.map((opt) => (
                      <label
                        key={opt.value}
                        className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                          layout === opt.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <input
                          type="radio"
                          name="layout"
                          value={opt.value}
                          checked={layout === opt.value}
                          onChange={() => setLayout(opt.value)}
                          className="mt-0.5 accent-blue-500 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className={`text-sm font-medium ${layout === opt.value ? 'text-blue-700' : 'text-gray-700'}`}>
                            {opt.label}
                          </div>
                          <a
                            href={`https://${opt.example}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-xs text-blue-400 hover:text-blue-600 hover:underline break-all"
                          >
                            {opt.example}
                          </a>
                        </div>
                      </label>
                    ))}
                  </div>
                </Field>
              </div>
            </div>
          </Section>

          {subCategories.length > 0 && (
            <Section title="Sub-categories *">
              <div className="flex flex-wrap gap-2">
                {subCategories.map((sc) => {
                  const active = subCategoryId === sc.id;
                  return (
                    <button
                      key={sc.id}
                      type="button"
                      onClick={() => toggleSubCat(sc.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                        active
                          ? 'bg-blue-500/20 border-blue-500/40 text-blue-300'
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      {sc.sub_category_name}
                    </button>
                  );
                })}
              </div>
            </Section>
          )}

          <Section title="Cover Image *">
            <input
              ref={coverRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleCoverFile(f); }}
            />
            {coverPreview ? (
              <div
                onClick={() => coverRef.current?.click()}
                className="relative cursor-pointer group rounded-xl overflow-hidden bg-slate-800 border border-slate-700 hover:border-blue-500/50 transition-colors h-48"
              >
                <img src={coverPreview} alt="cover" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Upload size={16} className="text-white" />
                  <span className="text-white text-sm font-medium">Change cover</span>
                </div>
              </div>
            ) : (
              <div
                onClick={() => coverRef.current?.click()}
                className="cursor-pointer rounded-xl border-2 border-dashed border-slate-700 hover:border-blue-500/40 transition-colors h-36 flex flex-col items-center justify-center gap-2 bg-slate-800/50"
              >
                <ImageIcon size={24} className="text-slate-500" />
                <p className="text-slate-500 text-sm">Click to upload cover</p>
                <p className="text-slate-600 text-xs">Max 2 MB</p>
              </div>
            )}
            {coverErr && <p className="text-red-400 text-xs mt-1">{coverErr}</p>}
          </Section>

          <Section title="Gallery Images (up to 10)">
            <div className="grid grid-cols-5 gap-2">
              {IMAGE_KEYS.map((key, i) => (
                <FileSlot
                  key={key}
                  label={`${i + 1}`}
                  existing={clearedImages.has(key) ? null : (item?.[key] ?? null)}
                  file={imageFiles[key]}
                  onFile={(f) => setImageFiles((prev) => ({ ...prev, [key]: f }))}
                  onClear={() => {
                    setImageFiles((prev) => ({ ...prev, [key]: null }));
                    setClearedImages((prev) => new Set([...prev, key]));
                  }}
                />
              ))}
            </div>
          </Section>

          {error && (
            <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3.5 py-2.5">
              {error}
            </p>
          )}

          <div className="flex items-center justify-between gap-3 pt-1 pb-2">
            <div>
              {item && onDelete && (
                <button
                  type="button"
                  onClick={() => { setShowDeleteConfirm(true); setDeleteError(''); }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !isFormValid}
                className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              >
                {loading && <Loader2 size={14} className="animate-spin" />}
                {item ? 'Save changes' : 'Create project'}
              </button>
            </div>
          </div>
        </form>

        {showDeleteConfirm && (
          <div className="absolute inset-0 z-10 flex items-center justify-center p-6 bg-slate-900/90 backdrop-blur-sm rounded-2xl">
            <div className="w-full max-w-sm text-center">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-500/15 mx-auto mb-4">
                <AlertTriangle size={20} className="text-red-400" />
              </div>
              <h3 className="text-white font-semibold text-base mb-1">Delete Project</h3>
              <p className="text-slate-400 text-sm mb-5">
                Are you sure you want to delete <span className="text-slate-200 font-medium">"{item?.title}"</span>? This cannot be undone.
              </p>
              {deleteError && (
                <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 mb-4">
                  {deleteError}
                </p>
              )}
              <div className="flex items-center gap-3">
                <button
                  disabled={deleteLoading}
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  disabled={deleteLoading}
                  onClick={handleDelete}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-red-500 hover:bg-red-600 text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {deleteLoading && <Loader2 size={13} className="animate-spin" />}
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</h3>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-400 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

const inputCls = 'w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all';
const selectCls = `${inputCls} appearance-none`;
