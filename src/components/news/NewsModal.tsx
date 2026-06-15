import { useState, useEffect, useRef, FormEvent } from 'react';
import { X, Loader2, Upload, Image as ImageIcon, ChevronDown } from 'lucide-react';
import { NewsItem, NewsCategory, NewsFormInput } from '../../types/news';
import { fetchCategories } from '../../services/newsApi';
import { useAuth } from '../../context/AuthContext';

interface NewsModalProps {
  item: NewsItem | null;
  onClose: () => void;
  onSubmit: (data: NewsFormInput) => Promise<void>;
}

const MAX_SIZE = 2 * 1024 * 1024;

function toInputDate(dateStr: string): string {
  const parts = dateStr.split('-');
  if (parts.length === 3 && parts[0].length === 2) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return dateStr;
}

function toApiDate(inputDate: string): string {
  const parts = inputDate.split('-');
  if (parts.length === 3 && parts[0].length === 4) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return inputDate;
}

export default function NewsModal({ item, onClose, onSubmit }: NewsModalProps) {
  const { token } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [link, setLink] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [fileError, setFileError] = useState('');

  const [categories, setCategories] = useState<NewsCategory[]>([]);
  const [catsLoading, setCatsLoading] = useState(true);
  const [catOpen, setCatOpen] = useState(false);
  const catRef = useRef<HTMLDivElement>(null);

  const [catError, setCatError] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // test
  useEffect(() => {
    if (!token) return;
    fetchCategories(token)
      .then(setCategories)
      .catch(() => setCategories([]))
      .finally(() => setCatsLoading(false));
  }, [token]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (catRef.current && !catRef.current.contains(e.target as Node)) {
        setCatOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    if (item) {
      setTitle(item.title);
      setDate(toInputDate(item.date));
      setCategoryId(item.category_id);
      setLink(item.link);
      setImagePreview(item.images);
    }
  }, [item]);

  const convertToWebP = (file: File, quality = 0.8): Promise<File> => {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas not supported"));
        return;
      }

      ctx.drawImage(img, 0, 0);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Failed to convert image"));
            return;
          }

          const webpFile = new File(
            [blob],
            file.name.replace(/\.[^/.]+$/, ".webp"),
            {
              type: "image/webp",
            }
          );

          resolve(webpFile);
        },
        "image/webp",
        quality
      );
    };

    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

const handleFile = async (file: File) => {
  try {
    setFileError("");

    const webpFile = await convertToWebP(file, 0.8);

    if (webpFile.size > MAX_SIZE) {
      setFileError("Image must be smaller than 2 MB");
      return;
    }

    setImageFile(webpFile);
    setImagePreview(URL.createObjectURL(webpFile));
  } catch {
    setFileError("Failed to process image");
  }
};

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    let valid = true;
    if (!imageFile && !item) {
      setFileError('Please select an image');
      valid = false;
    }
    if (!categoryId) {
      setCatError('Please select a category');
      valid = false;
    }
    if (!valid) return;
    setError('');
    setLoading(true);
    try {
      await onSubmit({
        title,
        date: toApiDate(date),
        category_id: categoryId,
        link,
        images: imageFile,
      });
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
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 flex-shrink-0">
          <h2 className="text-white font-semibold text-base">
            {item ? 'Edit News' : 'Add News'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="News title"
              className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Image {item && <span className="text-slate-600">(leave empty to keep current)</span>}
            </label>
            <div
              onClick={() => fileRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="relative cursor-pointer group"
            >
              {imagePreview ? (
                <div className="relative rounded-lg overflow-hidden h-36 bg-slate-800 border border-slate-700 group-hover:border-blue-500 transition-colors">
                  <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Upload size={16} className="text-white" />
                    <span className="text-white text-xs font-medium">Change image</span>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border-2 border-dashed border-slate-700 group-hover:border-blue-500 transition-colors h-28 flex flex-col items-center justify-center gap-2 bg-slate-800/50">
                  <ImageIcon size={22} className="text-slate-500" />
                  <p className="text-slate-500 text-xs">Click or drag to upload</p>
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />
            {fileError && <p className="text-red-400 text-xs mt-1.5">{fileError}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Category</label>
              {catsLoading ? (
                <div className="flex items-center gap-2 h-10">
                  <Loader2 size={14} className="animate-spin text-slate-500" />
                  <span className="text-slate-500 text-xs">Loading...</span>
                </div>
              ) : (
                <div ref={catRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setCatOpen((o) => !o)}
                    className={`w-full flex items-center justify-between bg-slate-800 border text-sm rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${catError ? 'border-red-500' : 'border-slate-700'}`}
                  >
                    <span className={categoryId ? 'text-white' : 'text-slate-500'}>
                      {categoryId ? categories.find((c) => c.id === categoryId)?.category_name ?? 'Select...' : 'Select...'}
                    </span>
                    <ChevronDown size={14} className={`text-slate-400 transition-transform ${catOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {catOpen && (
                    <div className="absolute z-10 mt-1 w-full bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden">
                      {categories.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => { setCategoryId(c.id); setCatOpen(false); setCatError(''); }}
                          className={`w-full text-left px-3.5 py-2.5 text-sm text-white hover:bg-slate-700 transition-colors ${c.id === categoryId ? 'bg-blue-500/20 text-blue-300' : ''}`}
                        >
                          {c.category_name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {catError && <p className="text-red-400 text-xs mt-1.5">{catError}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Link</label>
            <input
              type="url"
              required
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://..."
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
              disabled={loading}
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
