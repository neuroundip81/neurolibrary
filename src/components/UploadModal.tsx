import { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  Upload,
  FileText,
  Check,
  BookOpen,
  User,
  Calendar,
  Hash,
  Globe,
  AlignLeft,
  AlertTriangle,
} from 'lucide-react';
import type { Book, BookFormat } from '@/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UploadFormData {
  title: string;
  author: string;
  category: string;
  year: string;
  pages: string;
  language: string;
  description: string;
  format: BookFormat;
}

const CATEGORIES = [
  'Neurologi Klinis',
  'Neurochirurgi',
  'Neurofisiologi',
  'Neuroimaging',
  'Neuropediatri',
  'Neuro-onkologi',
  'Stroke',
  'Epilepsi',
  'Gangguan Gerak',
  'Lainnya',
];

type UploadStatus = 'idle' | 'uploading' | 'processing' | 'complete';

function getFormatFromFileName(fileName: string): BookFormat {
  const ext = fileName.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'pdf': return 'PDF';
    case 'doc': return 'DOC';
    case 'docx': return 'DOCX';
    case 'ppt': return 'PPT';
    case 'pptx': return 'PPTX';
    case 'xls': return 'XLS';
    case 'xlsx': return 'XLSX';
    default: return 'PDF';
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export default function UploadModal({ isOpen, onClose }: UploadModalProps) {
  const [, setBooks] = useLocalStorage<Book[]>('neuro_books', []);
  const [file, setFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<UploadFormData>({
    title: '',
    author: '',
    category: '',
    year: new Date().getFullYear().toString(),
    pages: '',
    language: 'Indonesia',
    description: '',
    format: 'PDF',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => firstInputRef.current?.focus(), 100);
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  // ESC to close
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape' && status !== 'uploading' && status !== 'processing') {
        handleClose();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [status],
  );

  const resetForm = useCallback(() => {
    setFile(null);
    setIsDragOver(false);
    setStatus('idle');
    setProgress(0);
    setError(null);
    setFormData({
      title: '',
      author: '',
      category: '',
      year: new Date().getFullYear().toString(),
      pages: '',
      language: 'Indonesia',
      description: '',
      format: 'PDF',
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const handleClose = useCallback(() => {
    if (status === 'uploading' || status === 'processing') return;
    resetForm();
    onClose();
  }, [onClose, resetForm, status]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    setError(null);

    const droppedFile = e.dataTransfer.files[0];
    if (!droppedFile) return;
    processFile(droppedFile);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const selected = e.target.files?.[0];
    if (!selected) return;
    processFile(selected);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function processFile(selectedFile: File) {
    const validExts = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx'];
    const ext = '.' + selectedFile.name.split('.').pop()?.toLowerCase();
    if (!validExts.includes(ext)) {
      setError('Format file tidak didukung. Gunakan PDF, Word, Excel, atau PowerPoint.');
      return;
    }

    // 5MB warning
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError(
        `File besar (${formatFileSize(selectedFile.size)}). Maksimal 5MB untuk penyimpanan lokal.`,
      );
      return;
    }

    setFile(selectedFile);
    const baseName = selectedFile.name.replace(/\.[^/.]+$/, '');
    const format = getFormatFromFileName(selectedFile.name);
    setFormData((prev) => ({
      ...prev,
      title: baseName,
      format,
    }));
  }

  const handleFormChange = (field: keyof UploadFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const simulateUpload = useCallback(async () => {
    setStatus('uploading');
    setProgress(0);

    // Simulate upload progress 0-70%
    for (let i = 0; i <= 70; i += 10) {
      setProgress(i);
      await new Promise((r) => setTimeout(r, 250));
    }

    setStatus('processing');
    setProgress(70);

    // Simulate processing 70-100%
    for (let i = 70; i <= 100; i += 10) {
      setProgress(i);
      await new Promise((r) => setTimeout(r, 200));
    }

    setStatus('complete');
  }, []);

  const handlePublish = useCallback(async () => {
    if (!file) return;

    if (!formData.title.trim()) {
      setError('Judul buku wajib diisi.');
      return;
    }

    setError(null);

    // Simulate upload progress
    await simulateUpload();

    // Save book metadata to localStorage
    const existingBooks = window.localStorage.getItem('neuro_books');
    const allBooks: Book[] = existingBooks ? JSON.parse(existingBooks) : [];

    // Find next ID
    const maxId = allBooks.reduce((max: number, b: Book) => {
      const num = parseInt(b.id, 10);
      return num > max ? num : max;
    }, 0);
    const nextId = (maxId + 1).toString();

    const newBook: Book = {
      id: nextId,
      title: formData.title.trim(),
      author: formData.author.trim() || 'Anonim',
      category: formData.category || 'Lainnya',
      categorySlug: (formData.category || 'lainnya').toLowerCase().replace(/\s+/g, '-'),
      description: formData.description.trim() || 'Tidak ada deskripsi.',
      coverImage: '/book-default.jpg',
      format: formData.format,
      rating: 0,
      ratingCount: 0,
      downloads: 0,
      year: parseInt(formData.year) || new Date().getFullYear(),
      pages: parseInt(formData.pages) || 0,
      isbn: '-',
      publisher: 'Upload Pengguna',
      language: formData.language || 'Indonesia',
      featured: false,
      tags: ['upload'],
    };

    allBooks.push(newBook);
    window.localStorage.setItem('neuro_books', JSON.stringify(allBooks));

    // Also update state
    setBooks(allBooks);

    // Store file as base64 (for demo) with size check
    if (file.size <= 2 * 1024 * 1024) {
      try {
        const reader = new FileReader();
        reader.onloadend = () => {
          const uploads = JSON.parse(window.localStorage.getItem('neuro_uploads') || '{}');
          uploads[nextId] = {
            fileName: file.name,
            data: reader.result as string,
            uploadedAt: new Date().toISOString(),
          };
          window.localStorage.setItem('neuro_uploads', JSON.stringify(uploads));
        };
        reader.readAsDataURL(file);
      } catch {
        // silently fail
      }
    }
  }, [file, formData, setBooks, simulateUpload]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && status !== 'uploading' && status !== 'processing')
          handleClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-modal-title"
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal panel */}
      <div
        ref={modalRef}
        onKeyDown={handleKeyDown}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[520px] overflow-hidden animate-modalIn flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#cffafe] flex-shrink-0">
          <div className="flex items-center gap-2">
            <Upload size={20} className="text-[#0e7490]" />
            <h2 id="upload-modal-title" className="text-lg font-semibold text-[#164e63] font-display">
              Upload Buku
            </h2>
          </div>
          <button
            onClick={handleClose}
            disabled={status === 'uploading' || status === 'processing'}
            className="w-10 h-10 rounded-full flex items-center justify-center text-[#64748b] hover:bg-[#f0f9ff] transition-colors disabled:opacity-50"
            aria-label="Tutup modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2.5 text-sm text-red-600">
              <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!file ? (
            /* Drag & Drop Area */
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200 ${
                isDragOver
                  ? 'border-[#0e7490] bg-[#f0f9ff] scale-[1.02]'
                  : 'border-[#0e7490]/40 hover:border-[#0e7490] hover:bg-[#f0f9ff]/50'
              }`}
            >
              <div
                className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center transition-colors ${
                  isDragOver ? 'bg-[#0e7490] text-white' : 'bg-[#f0f9ff] text-[#0e7490]'
                }`}
              >
                <Upload size={28} />
              </div>
              <p className="text-sm font-medium text-[#164e63] mb-1">
                Drag & drop file PDF, Word, Excel, atau PowerPoint
              </p>
              <p className="text-xs text-[#64748b] mb-4">atau klik untuk memilih file</p>
              <p className="text-[10px] text-[#94a3b8]">Maksimal 5MB</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          ) : (
            /* Upload Form */
            <div className="space-y-4">
              {/* File info */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-[#f0f9ff] border border-[#cffafe]">
                <div className="w-10 h-10 rounded-lg bg-[#0e7490]/10 flex items-center justify-center flex-shrink-0">
                  <FileText size={20} className="text-[#0e7490]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#164e63] truncate">{file.name}</p>
                  <p className="text-xs text-[#64748b]">
                    {formatFileSize(file.size)} &middot; {formData.format}
                  </p>
                </div>
                {status !== 'uploading' && status !== 'processing' && (
                  <button
                    onClick={() => {
                      setFile(null);
                      setError(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="text-[#64748b] hover:text-red-500 transition-colors"
                    aria-label="Hapus file"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Upload progress */}
              {(status === 'uploading' || status === 'processing' || status === 'complete') && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#64748b]">
                      {status === 'uploading' && 'Mengupload...'}
                      {status === 'processing' && 'Memproses...'}
                      {status === 'complete' && 'Selesai!'}
                    </span>
                    <span className="font-medium text-[#0e7490]">{progress}%</span>
                  </div>
                  <div className="h-2 bg-[#cffafe] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        status === 'complete' ? 'bg-green-500' : 'bg-[#0e7490]'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Success message */}
              {status === 'complete' && (
                <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-3 py-2.5 text-sm text-green-600">
                  <Check size={16} className="flex-shrink-0" />
                  <span>Buku berhasil diupload!</span>
                </div>
              )}

              {/* Form fields - hide when uploading/processing/complete */}
              {status === 'idle' && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handlePublish();
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label
                      htmlFor="upload-title"
                      className="block text-sm font-medium text-[#164e63] mb-1.5"
                    >
                      Judul Buku
                    </label>
                    <div className="relative">
                      <BookOpen
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]"
                      />
                      <input
                        ref={firstInputRef}
                        id="upload-title"
                        type="text"
                        value={formData.title}
                        onChange={(e) => handleFormChange('title', e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#cffafe] bg-white text-[#164e63] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#0e7490] focus:ring-2 focus:ring-[#0e7490]/15 transition-all"
                        placeholder="Judul buku"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="upload-author"
                      className="block text-sm font-medium text-[#164e63] mb-1.5"
                    >
                      Penulis
                    </label>
                    <div className="relative">
                      <User
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]"
                      />
                      <input
                        id="upload-author"
                        type="text"
                        value={formData.author}
                        onChange={(e) => handleFormChange('author', e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#cffafe] bg-white text-[#164e63] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#0e7490] focus:ring-2 focus:ring-[#0e7490]/15 transition-all"
                        placeholder="Nama penulis"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="upload-category"
                      className="block text-sm font-medium text-[#164e63] mb-1.5"
                    >
                      Kategori
                    </label>
                    <select
                      id="upload-category"
                      value={formData.category}
                      onChange={(e) => handleFormChange('category', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-[#cffafe] bg-white text-[#164e63] focus:outline-none focus:border-[#0e7490] focus:ring-2 focus:ring-[#0e7490]/15 transition-all text-sm"
                    >
                      <option value="">Pilih kategori...</option>
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="upload-year"
                        className="block text-sm font-medium text-[#164e63] mb-1.5"
                      >
                        Tahun
                      </label>
                      <div className="relative">
                        <Calendar
                          size={18}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]"
                        />
                        <input
                          id="upload-year"
                          type="number"
                          value={formData.year}
                          onChange={(e) => handleFormChange('year', e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#cffafe] bg-white text-[#164e63] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#0e7490] focus:ring-2 focus:ring-[#0e7490]/15 transition-all"
                          placeholder="2024"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="upload-pages"
                        className="block text-sm font-medium text-[#164e63] mb-1.5"
                      >
                        Halaman
                      </label>
                      <div className="relative">
                        <Hash
                          size={18}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]"
                        />
                        <input
                          id="upload-pages"
                          type="number"
                          value={formData.pages}
                          onChange={(e) => handleFormChange('pages', e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#cffafe] bg-white text-[#164e63] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#0e7490] focus:ring-2 focus:ring-[#0e7490]/15 transition-all"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="upload-language"
                      className="block text-sm font-medium text-[#164e63] mb-1.5"
                    >
                      Bahasa
                    </label>
                    <div className="relative">
                      <Globe
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]"
                      />
                      <input
                        id="upload-language"
                        type="text"
                        value={formData.language}
                        onChange={(e) => handleFormChange('language', e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#cffafe] bg-white text-[#164e63] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#0e7490] focus:ring-2 focus:ring-[#0e7490]/15 transition-all"
                        placeholder="Bahasa"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="upload-desc"
                      className="block text-sm font-medium text-[#164e63] mb-1.5"
                    >
                      Deskripsi
                    </label>
                    <div className="relative">
                      <AlignLeft
                        size={18}
                        className="absolute left-3 top-3 text-[#64748b]"
                      />
                      <textarea
                        id="upload-desc"
                        value={formData.description}
                        onChange={(e) => handleFormChange('description', e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#cffafe] bg-white text-[#164e63] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#0e7490] focus:ring-2 focus:ring-[#0e7490]/15 transition-all resize-none h-24 text-sm"
                        placeholder="Deskripsi singkat tentang buku..."
                      />
                    </div>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Footer actions */}
        {file && status === 'idle' && (
          <div className="flex-shrink-0 p-4 border-t border-[#cffafe] flex gap-3">
            <button
              onClick={handleClose}
              className="flex-1 py-2.5 rounded-lg border border-[#cffafe] text-[#64748b] font-medium text-sm hover:bg-[#f0f9ff] transition-all"
            >
              Batal
            </button>
            <button
              onClick={handlePublish}
              disabled={!formData.title.trim()}
              className="flex-1 py-2.5 rounded-lg bg-[#0e7490] text-white font-medium text-sm transition-all hover:bg-[#155e75] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Upload size={16} />
              Publish
            </button>
          </div>
        )}

        {status === 'complete' && (
          <div className="flex-shrink-0 p-4 border-t border-[#cffafe]">
            <button
              onClick={handleClose}
              className="w-full py-2.5 rounded-lg bg-[#0e7490] text-white font-medium text-sm transition-all hover:bg-[#155e75]"
            >
              Tutup
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
