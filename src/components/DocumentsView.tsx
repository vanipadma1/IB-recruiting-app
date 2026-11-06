import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Search,
  Download,
  Copy,
  Check,
  Tag,
  Paperclip,
  Building,
  Edit2,
  Trash2,
  X,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DocumentCategory, DocumentItem } from '../types';
import { formatDate } from '../utils/helpers';

const CATEGORIES: DocumentCategory[] = [
  'Resume',
  'Cover Letter',
  'Networking Email Template',
  'Thank-You Email Template',
  'Stock Pitch',
  'Technical Guide',
  'Behavioral Prep',
  'Bank Research',
  'Interview Notes',
  'Networking Notes',
  'Financial Modeling Resource',
  'Recruiting Timeline',
];

export const DocumentsView: React.FC<{
  onOpenQuickAddDocument: () => void;
}> = ({ onOpenQuickAddDocument }) => {
  const { state, saveDocument, deleteDocument } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);
  const [editingDoc, setEditingDoc] = useState<DocumentItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredDocs = state.documents.filter((doc) => {
    if (selectedCategory !== 'All' && doc.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        doc.title.toLowerCase().includes(q) ||
        (doc.bankAssociation && doc.bankAssociation.toLowerCase().includes(q)) ||
        doc.category.toLowerCase().includes(q) ||
        doc.notes.toLowerCase().includes(q) ||
        doc.content.toLowerCase().includes(q) ||
        doc.tags.some((t) => t.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const handleCopyContent = (doc: DocumentItem) => {
    navigator.clipboard.writeText(doc.content);
    setCopiedId(doc.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Recruiting Documents, Templates & Notes Library
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Central repository for tailored resumes, cover letters, cold email scripts, stock pitch memos, and technical guides
          </p>
        </div>

        <button
          onClick={onOpenQuickAddDocument}
          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors whitespace-nowrap self-start sm:self-auto"
        >
          <Plus size={14} />
          <span>Upload Document / Note</span>
        </button>
      </div>

      {/* Filter and Category Ribbon */}
      <div className="bg-white p-3.5 rounded border border-slate-200 shadow-sm space-y-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search templates, pitch memos, guides, and meeting notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400"
            >
              ×
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-3 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors ${
              selectedCategory === 'All'
                ? 'bg-slate-900 text-white font-semibold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Categories ({state.documents.length})
          </button>
          {CATEGORIES.map((cat) => {
            const count = state.documents.filter((d) => d.category === cat).length;
            if (count === 0 && selectedCategory !== cat) return null;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Document Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.map((doc) => (
          <div
            key={doc.id}
            onClick={() => setSelectedDoc(doc)}
            className="bg-white rounded border border-slate-200 p-4 shadow-2xs hover:border-blue-400 hover:shadow-sm cursor-pointer transition-all flex flex-col justify-between text-xs space-y-3"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                  {doc.category}
                </span>
                {doc.bankAssociation && (
                  <span className="text-[10px] font-medium text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                    {doc.bankAssociation}
                  </span>
                )}
              </div>

              <h3 className="font-bold text-slate-900 text-sm mt-2 line-clamp-1">{doc.title}</h3>

              {doc.notes && (
                <p className="text-slate-600 text-xs mt-1 line-clamp-2">{doc.notes}</p>
              )}

              {/* Tags */}
              {doc.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {doc.tags.slice(0, 3).map((t) => (
                    <span key={t} className="text-[10px] text-slate-500 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded">
                      {t}
                    </span>
                  ))}
                  {doc.tags.length > 3 && (
                    <span className="text-[10px] text-slate-400">+{doc.tags.length - 3}</span>
                  )}
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span className="font-mono">Updated {formatDate(doc.lastUpdated)}</span>
              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                {doc.content && (
                  <button
                    onClick={() => handleCopyContent(doc)}
                    className="p-1 text-slate-400 hover:text-slate-700 rounded"
                    title="Copy content"
                  >
                    {copiedId === doc.id ? (
                      <Check size={13} className="text-emerald-600" />
                    ) : (
                      <Copy size={13} />
                    )}
                  </button>
                )}
                <button
                  onClick={() => setEditingDoc(doc)}
                  className="p-1 text-slate-400 hover:text-blue-600 rounded"
                  title="Edit document"
                >
                  <Edit2 size={13} />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Delete document ${doc.title}?`)) {
                      deleteDocument(doc.id);
                      if (selectedDoc?.id === doc.id) setSelectedDoc(null);
                    }
                  }}
                  className="p-1 text-slate-400 hover:text-rose-600 rounded"
                  title="Delete"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Document Reader / Viewer Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 max-w-3xl w-full my-8 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                    {selectedDoc.category}
                  </span>
                  {selectedDoc.bankAssociation && (
                    <span className="text-[10px] text-slate-600 font-medium bg-slate-100 px-1.5 py-0.5 rounded">
                      {selectedDoc.bankAssociation}
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-slate-900 text-sm mt-1">{selectedDoc.title}</h3>
              </div>

              <div className="flex items-center gap-2">
                {selectedDoc.content && (
                  <button
                    onClick={() => handleCopyContent(selectedDoc)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-medium flex items-center gap-1.5 transition-colors"
                  >
                    {copiedId === selectedDoc.id ? (
                      <>
                        <Check size={13} className="text-emerald-600" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={13} />
                        <span>Copy Text</span>
                      </>
                    )}
                  </button>
                )}
                <button
                  onClick={() => setEditingDoc(selectedDoc)}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => setSelectedDoc(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto text-xs">
              {selectedDoc.notes && (
                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded text-amber-900">
                  <strong className="block text-amber-950 mb-0.5">Document Notes:</strong>
                  {selectedDoc.notes}
                </div>
              )}

              {selectedDoc.fileName && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Paperclip size={14} className="text-slate-500" />
                    <span className="font-medium text-slate-800">{selectedDoc.fileName}</span>
                    {selectedDoc.fileSize && (
                      <span className="text-slate-400 font-mono text-[11px]">
                        ({selectedDoc.fileSize})
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      // Trigger download of content
                      const element = document.createElement('a');
                      const file = new Blob([selectedDoc.content || 'Sample File Content'], {
                        type: 'text/plain',
                      });
                      element.href = URL.createObjectURL(file);
                      element.download = selectedDoc.fileName || 'download.txt';
                      document.body.appendChild(element);
                      element.click();
                      document.body.removeChild(element);
                    }}
                    className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-50 rounded text-[11px] font-medium text-slate-700 flex items-center gap-1"
                  >
                    <Download size={12} />
                    <span>Download File</span>
                  </button>
                </div>
              )}

              {/* Text / Code / Template Preview */}
              <div>
                <div className="font-semibold text-slate-800 uppercase text-[10px] tracking-wider mb-1.5">
                  Full Content & Text
                </div>
                <div className="bg-slate-900 text-slate-100 p-4 rounded border border-slate-800 font-mono text-xs whitespace-pre-line leading-relaxed overflow-x-auto select-all">
                  {selectedDoc.content || 'No text content provided.'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Document Modal */}
      {editingDoc && (
        <DocumentModal
          document={editingDoc}
          onClose={() => setEditingDoc(null)}
          onSave={async (saved) => {
            await saveDocument(saved);
            setEditingDoc(null);
            if (selectedDoc?.id === saved.id) setSelectedDoc(saved as DocumentItem);
          }}
        />
      )}
    </div>
  );
};

// Sub-component: Document Create/Edit Modal with File Upload
export const DocumentModal: React.FC<{
  document: Partial<DocumentItem>;
  onClose: () => void;
  onSave: (doc: Partial<DocumentItem>) => Promise<void>;
}> = ({ document, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<DocumentItem>>({
    title: document.title || '',
    category: document.category || 'Resume',
    bankAssociation: document.bankAssociation || null,
    notes: document.notes || '',
    content: document.content || '',
    fileName: document.fileName || null,
    fileSize: document.fileSize || null,
    tags: document.tags || [],
    id: document.id,
  });

  const [tagInput, setTagInput] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setFormData({
          ...formData,
          fileName: file.name,
          fileSize: `${(file.size / 1024).toFixed(0)} KB`,
          content: typeof reader.result === 'string' ? reader.result : formData.content,
        });
      };
      // Read text content
      reader.readAsText(file);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl border border-slate-200 max-w-2xl w-full my-8 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0">
          <h3 className="font-bold text-slate-900 text-sm">
            {formData.id ? `Edit Document: ${formData.title}` : 'Upload / Add Recruiting Document'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Document Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Master IB Resume v4.2 or Evercore Cold Email Script"
              className="w-full px-3 py-1.5 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Category *</label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value as DocumentCategory })
                }
                className="w-full px-3 py-1.5 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-600"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Bank Association (Optional)</label>
              <input
                type="text"
                value={formData.bankAssociation || ''}
                onChange={(e) => setFormData({ ...formData, bankAssociation: e.target.value || null })}
                placeholder="e.g. Goldman Sachs, Evercore"
                className="w-full px-3 py-1.5 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>
          </div>

          {/* File Upload Attachment */}
          <div className="p-3 bg-slate-50 border border-dashed border-slate-300 rounded space-y-2">
            <label className="block font-medium text-slate-700 text-xs">
              Attach Local File (PDF, Word, Text, Markdown)
            </label>
            <input
              type="file"
              onChange={handleFileUpload}
              className="block w-full text-xs text-slate-500 file:mr-3 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {formData.fileName && (
              <div className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                <Check size={12} />
                <span>Attached: {formData.fileName} ({formData.fileSize})</span>
              </div>
            )}
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Document Content / Text Body</label>
            <textarea
              rows={8}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Paste resume text, cold email templates, pitch memos, or notes..."
              className="w-full font-mono text-xs px-3 py-2 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Context Notes</label>
            <input
              type="text"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Where was this used? Which banker reviewed it?"
              className="w-full px-3 py-1.5 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold shadow-sm"
            >
              Save Document
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
