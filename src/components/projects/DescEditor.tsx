import { useRef, useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { Image as ImageIcon } from 'lucide-react';

interface Props {
  value: string;
  onChange: (html: string) => void;
}

export default function DescEditor({ value, onChange }: Props) {
  const [imgUrl, setImgUrl] = useState('');
  const [showImgInput, setShowImgInput] = useState(false);
  const imgInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // keep only paragraph and text
        heading: false,
        blockquote: false,
        bulletList: false,
        orderedList: false,
        listItem: false,
        codeBlock: false,
        code: false,
        horizontalRule: false,
        strike: false,
        bold: false,
        italic: false,
      }),
      Image.extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            style: { default: 'width:100%' },
          };
        },
      }).configure({ inline: false, allowBase64: false }),
      Placeholder.configure({ placeholder: 'Write a description...' }),
    ],
    content: value || '',
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (current !== value) {
      editor.commands.setContent(value || '', false);
    }
  }, [value, editor]);

  const insertImage = () => {
    const url = imgUrl.trim();
    if (!url || !editor) return;
    editor.chain().focus().setImage({ src: url, style: 'width:100%' } as never).run();
    setImgUrl('');
    setShowImgInput(false);
  };

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-800/50 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:border-transparent transition-all">
      {/* toolbar */}
      <div className="flex items-center gap-1 px-2 py-1.5 border-b border-slate-700 bg-slate-800/80">
        <button
          type="button"
          title="Insert image URL"
          onClick={() => {
            setShowImgInput((v) => !v);
            setTimeout(() => imgInputRef.current?.focus(), 50);
          }}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
            showImgInput
              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
          }`}
        >
          <ImageIcon size={13} />
          Image URL
        </button>

        {showImgInput && (
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <input
              ref={imgInputRef}
              type="url"
              value={imgUrl}
              onChange={(e) => setImgUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') { e.preventDefault(); insertImage(); }
                if (e.key === 'Escape') { setShowImgInput(false); setImgUrl(''); }
              }}
              placeholder="https://example.com/image.jpg"
              className="flex-1 min-w-0 bg-slate-900 border border-slate-600 text-white text-xs placeholder-slate-500 rounded px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
            />
            <button
              type="button"
              onClick={insertImage}
              className="px-2.5 py-1 rounded bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium transition-colors flex-shrink-0"
            >
              Insert
            </button>
            <button
              type="button"
              onClick={() => { setShowImgInput(false); setImgUrl(''); }}
              className="px-2 py-1 rounded text-slate-400 hover:text-slate-200 hover:bg-white/5 text-xs transition-colors flex-shrink-0"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* editor area */}
      <style>{`
        .desc-editor .tiptap {
          padding: 12px 14px;
          min-height: 140px;
          outline: none;
          color: #e2e8f0;
          font-size: 14px;
          line-height: 1.65;
        }
        .desc-editor .tiptap p {
          margin-bottom: 10px;
        }
        .desc-editor .tiptap p:last-child {
          margin-bottom: 0;
        }
        .desc-editor .tiptap p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #475569;
          pointer-events: none;
          height: 0;
        }
        .desc-editor .tiptap img {
          width: 100%;
          display: block;
          border-radius: 8px;
          margin: 10px 0;
          border: 1px solid #334155;
        }
        .desc-editor .tiptap img.ProseMirror-selectednode {
          outline: 2px solid #3b82f6;
          border-radius: 8px;
        }
      `}</style>

      <div className="desc-editor">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
