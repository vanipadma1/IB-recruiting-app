import React, { useState } from 'react';
import {
  Search,
  Plus,
  Download,
  Upload,
  RotateCcw,
  UserPlus,
  Briefcase,
  PhoneCall,
  CheckSquare,
  FileText,
  Calendar,
} from 'lucide-react';
import { NavigationTab, useApp } from '../context/AppContext';

interface TopBarProps {
  onOpenQuickAdd: (type: 'contact' | 'application' | 'interaction' | 'task' | 'document' | 'interview') => void;
  onOpenImportModal: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onOpenQuickAdd, onOpenImportModal }) => {
  const { activeTab, setActiveTab, filters, setFilters, exportCsv, resetToSampleData } = useApp();
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  const getBreadcrumbTitle = (tab: NavigationTab) => {
    switch (tab) {
      case 'dashboard':
        return 'Executive Overview';
      case 'crm':
        return 'Networking CRM';
      case 'applications':
        return 'Internship Applications';
      case 'interviews':
        return 'Interview Preparation & Question Bank';
      case 'documents':
        return 'Recruiting Documents & Notes';
      case 'banks':
        return 'Bank & Firm Research';
      case 'tasks':
        return 'Tasks & Follow-Ups';
      case 'analytics':
        return 'Recruiting Analytics & Funnel';
      case 'goals':
        return 'Recruiting Goals & Targets';
      case 'settings':
        return 'Settings & CSV Import / Export';
      default:
        return 'IB Recruiting Hub';
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between gap-6 shrink-0 z-10">
      {/* Zone 1: Contextual Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-slate-500 whitespace-nowrap shrink-0">
        <span className="font-semibold text-slate-900 text-sm">
          {getBreadcrumbTitle(activeTab)}
        </span>
      </div>

      {/* Zone 2: Global Search Bar */}
      <div className="flex-1 max-w-md hidden sm:block">
        <div className="relative">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search contacts, banks, notes, or technical questions..."
            value={filters.crmSearch || ''}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                crmSearch: e.target.value,
                appSearch: e.target.value,
              }))
            }
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white transition-all"
          />
          {filters.crmSearch && (
            <button
              onClick={() => setFilters((prev) => ({ ...prev, crmSearch: '', appSearch: '' }))}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Zone 3: Primary Actions (Quick Add, Export, Reset) */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Quick Add Dropdown */}
        <div className="relative">
          <button
            onClick={() => setQuickAddOpen(!quickAddOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium shadow-sm transition-colors whitespace-nowrap"
          >
            <Plus size={14} />
            <span>Quick Add</span>
          </button>

          {quickAddOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setQuickAddOpen(false)}
              />
              <div className="absolute right-0 mt-1 w-52 bg-white rounded-md shadow-lg border border-slate-200 py-1 z-40 text-xs">
                <button
                  onClick={() => {
                    setQuickAddOpen(false);
                    onOpenQuickAdd('contact');
                  }}
                  className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <UserPlus size={14} className="text-blue-600" />
                  <span>New Contact</span>
                </button>
                <button
                  onClick={() => {
                    setQuickAddOpen(false);
                    onOpenQuickAdd('interaction');
                  }}
                  className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <PhoneCall size={14} className="text-emerald-600" />
                  <span>Log Interaction / Coffee Chat</span>
                </button>
                <button
                  onClick={() => {
                    setQuickAddOpen(false);
                    onOpenQuickAdd('application');
                  }}
                  className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <Briefcase size={14} className="text-indigo-600" />
                  <span>New Application</span>
                </button>
                <button
                  onClick={() => {
                    setQuickAddOpen(false);
                    onOpenQuickAdd('interview');
                  }}
                  className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <Calendar size={14} className="text-purple-600" />
                  <span>Schedule Interview</span>
                </button>
                <button
                  onClick={() => {
                    setQuickAddOpen(false);
                    onOpenQuickAdd('task');
                  }}
                  className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <CheckSquare size={14} className="text-amber-600" />
                  <span>New Follow-Up / Task</span>
                </button>
                <button
                  onClick={() => {
                    setQuickAddOpen(false);
                    onOpenQuickAdd('document');
                  }}
                  className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <FileText size={14} className="text-rose-600" />
                  <span>Upload Document / Note</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* CSV Export & Import Shortcuts */}
        <div className="hidden lg:flex items-center gap-1">
          <button
            onClick={() => exportCsv('contacts')}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded text-xs transition-colors"
            title="Export Contacts to CSV"
          >
            <Download size={15} />
          </button>
          <button
            onClick={onOpenImportModal}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded text-xs transition-colors"
            title="Import Contacts / Applications from CSV"
          >
            <Upload size={15} />
          </button>
        </div>

        {/* Reset to Sample Data */}
        <button
          onClick={() => setResetConfirmOpen(true)}
          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded text-xs transition-colors"
          title="Reset to Sample Data"
        >
          <RotateCcw size={14} />
        </button>
      </div>

      {/* Reset Confirmation Dialog */}
      {resetConfirmOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 max-w-sm w-full p-5">
            <h3 className="font-semibold text-slate-900 text-sm">Reset Sample Data?</h3>
            <p className="text-xs text-slate-600 mt-2">
              This will restore the realistic demonstration database (contacts at Evercore, Goldman, Morgan Stanley, applications, technical questions, and documents).
            </p>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setResetConfirmOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  resetToSampleData();
                  setResetConfirmOpen(false);
                }}
                className="px-3 py-1.5 text-xs bg-slate-900 text-white hover:bg-slate-800 rounded font-medium"
              >
                Reset Database
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
