import React, { useState } from 'react';
import { X, Upload, FileText, Check, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const CsvImportModal: React.FC<{
  onClose: () => void;
}> = ({ onClose }) => {
  const { importCsv } = useApp();

  const [importType, setImportType] = useState<'contacts' | 'applications'>('contacts');
  const [csvContent, setCsvContent] = useState('');
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sampleContactsCsv = `First Name,Last Name,Bank,Firm Type,Division,Group,Job Title,Seniority,School,Grad Year,Location,Email,LinkedIn,How Found,Referral Source,Status,Strength,Date Added
Jonathan,Hayes,Evercore,Elite Boutique,Investment Banking,M&A,Analyst 1,Analyst,Wharton,2026,New York NY,jhayes@evercore.com,https://linkedin.com,Penn Alumni,Finance Club,Connected,3,2026-11-01
Priya,Patel,Morgan Stanley,Bulge Bracket,Global Banking,Healthcare,Associate 2,Associate,Columbia,2023,New York NY,ppatel@morganstanley.com,https://linkedin.com,Cold Email,Alumni Portal,Spoke,4,2026-11-02`;

  const sampleAppsCsv = `Bank,Firm Type,Position,Division,Group,Program,Location,Recruiting Cycle,Status,Deadline,Date Applied
Moelis & Company,Elite Boutique,Summer Analyst,Investment Banking,Restructuring,Summer Analyst 2027,New York NY,Summer 2027,Applied,2026-12-01,2026-11-01
Barclays,Bulge Bracket,Investment Banking Summer Analyst,Banking,Power & Utilities,Summer Analyst Program,New York NY,Summer 2027,Interested,2026-12-15,`;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setCsvContent(reader.result);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvContent.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await importCsv(importType, csvContent);
      setResultMessage(`Successfully imported ${res.count} records!`);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setResultMessage('Error parsing CSV. Please check formatting.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl border border-slate-200 max-w-xl w-full my-8 flex flex-col text-xs">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Import CSV Spreadsheet</h3>
            <p className="text-slate-500 text-[11px] mt-0.5">
              Bulk import existing bankers or applications from Excel / Google Sheets
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleImport} className="p-6 space-y-4">
          {/* Import Type Selector */}
          <div>
            <label className="block font-medium text-slate-700 mb-1">Select Import Type *</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setImportType('contacts');
                  setCsvContent('');
                }}
                className={`flex-1 py-1.5 rounded font-medium border ${
                  importType === 'contacts'
                    ? 'bg-blue-50 border-blue-600 text-blue-700 font-semibold'
                    : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                Banker Contacts
              </button>
              <button
                type="button"
                onClick={() => {
                  setImportType('applications');
                  setCsvContent('');
                }}
                className={`flex-1 py-1.5 rounded font-medium border ${
                  importType === 'applications'
                    ? 'bg-blue-50 border-blue-600 text-blue-700 font-semibold'
                    : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                Internship Applications
              </button>
            </div>
          </div>

          {/* File Upload Option */}
          <div className="p-3 bg-slate-50 border border-dashed border-slate-300 rounded space-y-1">
            <label className="block font-medium text-slate-700">Choose CSV File from Computer</label>
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileUpload}
              className="block w-full text-xs text-slate-500 file:mr-3 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          {/* Paste CSV Content Box */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-medium text-slate-700">
                Or Paste Raw CSV Rows (with header):
              </label>
              <button
                type="button"
                onClick={() =>
                  setCsvContent(importType === 'contacts' ? sampleContactsCsv : sampleAppsCsv)
                }
                className="text-[11px] text-blue-600 hover:underline"
              >
                Insert Sample Format
              </button>
            </div>
            <textarea
              rows={6}
              required
              value={csvContent}
              onChange={(e) => setCsvContent(e.target.value)}
              placeholder="Paste comma-separated rows here..."
              className="w-full font-mono text-[11px] px-3 py-2 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>

          {resultMessage && (
            <div
              className={`p-2.5 rounded text-xs flex items-center gap-1.5 ${
                resultMessage.includes('Success')
                  ? 'bg-emerald-50 text-emerald-800'
                  : 'bg-rose-50 text-rose-800'
              }`}
            >
              {resultMessage.includes('Success') ? <Check size={14} /> : <AlertCircle size={14} />}
              <span>{resultMessage}</span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !csvContent.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded font-semibold shadow-sm"
            >
              {isSubmitting ? 'Importing...' : 'Execute CSV Import'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
