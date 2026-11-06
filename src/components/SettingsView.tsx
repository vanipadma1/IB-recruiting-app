import React, { useState } from 'react';
import {
  Settings,
  Download,
  Upload,
  RotateCcw,
  User,
  GraduationCap,
  Save,
  Check,
  FileSpreadsheet,
  Database,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserProfile } from '../types';

export const SettingsView: React.FC<{
  onOpenImportModal: () => void;
}> = ({ onOpenImportModal }) => {
  const { state, saveProfile, resetToSampleData, exportCsv } = useApp();

  const [profileForm, setProfileForm] = useState<UserProfile>(state.userProfile);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveProfile(profileForm);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleDownloadBackup = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `ib_recruiting_hub_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 text-xs">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          Account Settings, Candidate Profile & Data Management
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure your academic profile, export CSV backups for Excel, or import prior networking spreadsheets
        </p>
      </div>

      {/* Candidate Profile Card */}
      <div className="bg-white rounded border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <User size={16} className="text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900">Candidate Recruiting Profile</h2>
          </div>
          {savedSuccess && (
            <span className="flex items-center gap-1 text-emerald-700 font-semibold text-xs">
              <Check size={14} />
              <span>Profile Saved Successfully</span>
            </span>
          )}
        </div>

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-600 text-xs"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-600 text-xs font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block font-medium text-slate-700 mb-1">University / Undergraduate School *</label>
              <input
                type="text"
                required
                value={profileForm.university}
                onChange={(e) => setProfileForm({ ...profileForm, university: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-600 text-xs"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Cumulative GPA</label>
              <input
                type="text"
                value={profileForm.gpa}
                onChange={(e) => setProfileForm({ ...profileForm, gpa: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-600 text-xs font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block font-medium text-slate-700 mb-1">Degree & Major / Concentrations</label>
              <input
                type="text"
                value={profileForm.major}
                onChange={(e) => setProfileForm({ ...profileForm, major: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-600 text-xs"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Graduation Class Year</label>
              <input
                type="number"
                value={profileForm.graduationYear}
                onChange={(e) =>
                  setProfileForm({
                    ...profileForm,
                    graduationYear: parseInt(e.target.value, 10) || 2027,
                  })
                }
                className="w-full px-3 py-1.5 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-600 text-xs font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Target Recruiting Cycle</label>
              <input
                type="text"
                value={profileForm.targetCycle}
                onChange={(e) => setProfileForm({ ...profileForm, targetCycle: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-600 text-xs"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Active Master Resume File Name</label>
              <input
                type="text"
                value={profileForm.currentResumeVersion}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, currentResumeVersion: e.target.value })
                }
                className="w-full px-3 py-1.5 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-600 text-xs font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold shadow-sm flex items-center gap-1.5"
            >
              <Save size={13} />
              <span>Update Profile</span>
            </button>
          </div>
        </form>
      </div>

      {/* CSV Export & Import Center */}
      <div className="bg-white rounded border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <FileSpreadsheet size={16} className="text-emerald-600" />
          <h2 className="text-sm font-bold text-slate-900">CSV Export & Import Integration</h2>
        </div>

        <p className="text-slate-600 text-xs leading-relaxed">
          Easily export your data to Excel-compatible CSV spreadsheets, or bulk import existing networking trackers and school finance club databases.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Export Box */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded space-y-3">
            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
              <Download size={14} className="text-blue-600" />
              <span>Export CSV Spreadsheets</span>
            </div>
            <p className="text-slate-500 text-[11px]">
              Download complete comma-separated files of your contacts and applications for offline modeling.
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => exportCsv('contacts')}
                className="px-3 py-1.5 bg-white border border-slate-300 hover:border-slate-400 rounded text-slate-700 font-medium shadow-2xs"
              >
                Export Contacts ({state.contacts.length})
              </button>
              <button
                onClick={() => exportCsv('applications')}
                className="px-3 py-1.5 bg-white border border-slate-300 hover:border-slate-400 rounded text-slate-700 font-medium shadow-2xs"
              >
                Export Applications ({state.applications.length})
              </button>
            </div>
          </div>

          {/* Import Box */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded space-y-3">
            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
              <Upload size={14} className="text-emerald-600" />
              <span>Import Existing CSV Tracker</span>
            </div>
            <p className="text-slate-500 text-[11px]">
              Upload or paste rows from Google Sheets, Excel, or alumni spreadsheets directly into the CRM.
            </p>
            <div>
              <button
                onClick={onOpenImportModal}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-semibold shadow-2xs"
              >
                Open CSV Import Tool
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Database Management & Backup */}
      <div className="bg-white rounded border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Database size={16} className="text-indigo-600" />
          <h2 className="text-sm font-bold text-slate-900">Database Storage & Demonstration Reset</h2>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="font-semibold text-slate-900">JSON Database Backup</div>
            <p className="text-slate-500 text-[11px] mt-0.5">
              Save a full raw snapshot of all tables (contacts, interactions, applications, question bank, documents, and banks).
            </p>
          </div>
          <button
            onClick={handleDownloadBackup}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-medium shrink-0 self-start sm:self-auto"
          >
            Download JSON Backup
          </button>
        </div>

        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="font-semibold text-slate-900">Reset to Realistic Demonstration Data</div>
            <p className="text-slate-500 text-[11px] mt-0.5">
              Restores the default sample records (Goldman Sachs, Evercore, Centerview, Morgan Stanley, Jefferies offer, and 400-question technical prep).
            </p>
          </div>
          <button
            onClick={() => setResetConfirmOpen(true)}
            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded font-medium shrink-0 self-start sm:self-auto"
          >
            Reset Sample Data
          </button>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {resetConfirmOpen && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 max-w-sm w-full p-5 space-y-3">
            <div className="flex items-center gap-2 text-rose-600">
              <AlertTriangle size={18} />
              <h3 className="font-bold text-slate-900 text-sm">Reset Sample Data?</h3>
            </div>
            <p className="text-xs text-slate-600">
              This will overwrite your database with the pristine initial investment banking recruiting dataset. Any custom records you created will be refreshed.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setResetConfirmOpen(false)}
                className="px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded font-medium"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await resetToSampleData();
                  setResetConfirmOpen(false);
                }}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded font-semibold"
              >
                Reset Database
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
