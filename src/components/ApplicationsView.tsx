import React, { useState } from 'react';
import {
  Briefcase,
  Plus,
  Table,
  Kanban,
  Calendar as CalendarIcon,
  Search,
  ExternalLink,
  ChevronRight,
  Edit2,
  Trash2,
  Users,
  CheckCircle2,
  Clock,
  Award,
  AlertCircle,
  FileText,
  X,
  ArrowRight,
  MoveRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import { Application, ApplicationStatus, FirmType } from '../types';
import { formatDate, isPastDate, isToday, isWithinDays, IB_BANKS_SUGGESTIONS, IB_GROUPS_SUGGESTIONS } from '../utils/helpers';

const KANBAN_STAGES: { stage: ApplicationStatus; label: string; color: string }[] = [
  { stage: 'Networking', label: 'Networking & Research', color: 'border-slate-300 bg-slate-50' },
  { stage: 'Preparing to Apply', label: 'Preparing App', color: 'border-blue-200 bg-blue-50/30' },
  { stage: 'Applied', label: 'Applied / Assessment', color: 'border-indigo-200 bg-indigo-50/30' },
  { stage: 'First Round', label: 'First Round', color: 'border-purple-200 bg-purple-50/30' },
  { stage: 'Superday', label: 'Superday', color: 'border-amber-200 bg-amber-50/30' },
  { stage: 'Offer', label: 'Offer Received', color: 'border-emerald-300 bg-emerald-50/50' },
];

export const ApplicationsView: React.FC<{
  onOpenQuickAddApplication: () => void;
}> = ({ onOpenQuickAddApplication }) => {
  const { state, filters, setFilters, deleteApplication, updateApplicationStatus, saveApplication } = useApp();

  const [viewMode, setViewMode] = useState<'kanban' | 'table' | 'calendar'>('kanban');
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [editingApp, setEditingApp] = useState<Application | null>(null);

  // Filters
  const [stageFilter, setStageFilter] = useState<string>(filters.appStage || 'All');
  const [searchQuery, setSearchQuery] = useState<string>(filters.appSearch || '');

  // Filtered applications
  const filteredApps = state.applications.filter((app) => {
    if (stageFilter !== 'All' && app.status !== stageFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        app.bank.toLowerCase().includes(q) ||
        app.positionTitle.toLowerCase().includes(q) ||
        app.group.toLowerCase().includes(q) ||
        app.division.toLowerCase().includes(q) ||
        (app.notes && app.notes.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const selectedApp = state.applications.find((a) => a.id === selectedAppId);
  const selectedBankContacts = selectedApp
    ? state.contacts.filter(
        (c) =>
          c.bank.toLowerCase() === selectedApp.bank.toLowerCase() ||
          selectedApp.associatedContactIds.includes(c.id) ||
          selectedApp.referralContactId === c.id
      )
    : [];
  const selectedBankInteractions = selectedApp
    ? state.interactions.filter((i) =>
        selectedBankContacts.some((c) => c.id === i.contactId)
      )
    : [];

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-12">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Internship Application Tracker
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor deadlines, internal referrals, HireVue screens, first rounds, and superdays
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Switcher */}
          <div className="flex items-center p-0.5 bg-slate-100 rounded border border-slate-200 text-xs">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-medium transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Kanban size={13} />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-medium transition-colors ${
                viewMode === 'table'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Table size={13} />
              <span>Table</span>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-medium transition-colors ${
                viewMode === 'calendar'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarIcon size={13} />
              <span>Calendar</span>
            </button>
          </div>

          <button
            onClick={onOpenQuickAddApplication}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors whitespace-nowrap"
          >
            <Plus size={14} />
            <span>New Application</span>
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-3 rounded border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-3 text-xs">
        <div className="relative flex-1 w-full">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by bank name, position, group, or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
            >
              ×
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded text-slate-700 focus:outline-none focus:bg-white"
          >
            <option value="All">All Stages</option>
            <option value="Interested">Interested</option>
            <option value="Researching">Researching</option>
            <option value="Networking">Networking</option>
            <option value="Preparing to Apply">Preparing to Apply</option>
            <option value="Applied">Applied</option>
            <option value="Referral Received">Referral Received</option>
            <option value="Online Assessment">Online Assessment</option>
            <option value="First Round">First Round</option>
            <option value="Superday">Superday</option>
            <option value="Offer">Offer</option>
            <option value="Rejected">Rejected</option>
          </select>

          {(stageFilter !== 'All' || searchQuery) && (
            <button
              onClick={() => {
                setStageFilter('All');
                setSearchQuery('');
                setFilters((prev) => ({ ...prev, appStage: undefined, appSearch: undefined }));
              }}
              className="text-xs text-rose-600 hover:text-rose-800 font-medium"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* 1. KANBAN BOARD VIEW */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3 items-start overflow-x-auto pb-4">
          {KANBAN_STAGES.map((col) => {
            // Group apps that belong to this column
            const colApps = state.applications.filter((a) => {
              if (col.stage === 'Networking') {
                return ['Interested', 'Researching', 'Networking'].includes(a.status);
              }
              if (col.stage === 'Preparing to Apply') {
                return a.status === 'Preparing to Apply' || a.status === 'Referral Requested';
              }
              if (col.stage === 'Applied') {
                return (
                  a.status === 'Applied' ||
                  a.status === 'Referral Received' ||
                  a.status === 'Online Assessment'
                );
              }
              return a.status === col.stage;
            });

            return (
              <div
                key={col.stage}
                className="bg-slate-100/70 rounded border border-slate-200/80 p-2.5 min-w-[210px] flex flex-col max-h-[80vh]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/80">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-slate-800">{col.label}</span>
                  </div>
                  <span className="text-[10px] font-mono font-semibold bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-600">
                    {colApps.length}
                  </span>
                </div>

                {/* Cards List */}
                <div className="space-y-2.5 overflow-y-auto flex-1 pr-0.5">
                  {colApps.map((app) => {
                    const isOffer = app.status === 'Offer';
                    const hasReferral = Boolean(app.referralContactId);
                    const associatedCount = app.associatedContactIds.length;

                    return (
                      <div
                        key={app.id}
                        onClick={() => setSelectedAppId(app.id)}
                        className={`p-3 bg-white rounded border cursor-pointer hover:shadow-sm transition-all text-xs space-y-2 ${
                          isOffer
                            ? 'border-emerald-300 ring-1 ring-emerald-300/50 bg-emerald-50/20'
                            : 'border-slate-200 hover:border-blue-400'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <div>
                            <div className="font-bold text-slate-900 text-xs">{app.bank}</div>
                            <div className="text-[11px] text-slate-500 font-medium">{app.group}</div>
                          </div>
                          {isOffer ? (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                              OFFER
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-mono">
                              {app.firmType.split(' ')[0]}
                            </span>
                          )}
                        </div>

                        {/* Deadlines / Interview Dates */}
                        <div className="text-[11px] text-slate-600 space-y-0.5">
                          {app.interviewDates.length > 0 ? (
                            <div className="flex items-center gap-1 text-purple-700 font-medium">
                              <CalendarIcon size={11} />
                              <span>Interview: {formatDate(app.interviewDates[0])}</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-slate-500">
                              <Clock size={11} />
                              <span>Deadline: {formatDate(app.applicationDeadline)}</span>
                            </div>
                          )}
                        </div>

                        {/* Badges: Referral & Associated Contacts */}
                        <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-slate-100 text-slate-500">
                          <div className="flex items-center gap-1">
                            <Users size={11} className="text-slate-400" />
                            <span>
                              {hasReferral ? (
                                <span className="text-emerald-700 font-medium">Referral Set</span>
                              ) : associatedCount > 0 ? (
                                `${associatedCount} Contact${associatedCount === 1 ? '' : 's'}`
                              ) : (
                                'No Contacts'
                              )}
                            </span>
                          </div>

                          {/* Quick Stage Mover Selector */}
                          <select
                            value={app.status}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) =>
                              updateApplicationStatus(app.id, e.target.value as ApplicationStatus)
                            }
                            className="text-[10px] font-medium bg-slate-50 border border-slate-200 rounded px-1 py-0.5 text-slate-700 hover:bg-white"
                          >
                            <option value="Networking">Networking</option>
                            <option value="Preparing to Apply">Preparing</option>
                            <option value="Applied">Applied</option>
                            <option value="Online Assessment">Assessment</option>
                            <option value="First Round">First Round</option>
                            <option value="Superday">Superday</option>
                            <option value="Offer">Offer</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 2. TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="bg-white rounded border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-2.5 px-3">Bank / Firm</th>
                  <th className="py-2.5 px-3">Position & Group</th>
                  <th className="py-2.5 px-3">Location</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Deadline</th>
                  <th className="py-2.5 px-3">Date Applied</th>
                  <th className="py-2.5 px-3">Referral / Contacts</th>
                  <th className="py-2.5 px-3">Next Action</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {filteredApps.map((app) => (
                  <tr
                    key={app.id}
                    onClick={() => setSelectedAppId(app.id)}
                    className="hover:bg-blue-50/40 cursor-pointer transition-colors"
                  >
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <div className="font-bold text-slate-900">{app.bank}</div>
                      <div className="text-[10px] text-slate-500">{app.firmType}</div>
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <div className="font-medium text-slate-800">{app.positionTitle}</div>
                      <div className="text-[10px] text-slate-500">{app.group}</div>
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap text-slate-600">
                      {app.location}
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${
                          app.status === 'Offer'
                            ? 'bg-emerald-50 text-emerald-700 font-bold'
                            : app.status === 'Superday'
                            ? 'bg-amber-50 text-amber-700 font-semibold'
                            : app.status === 'First Round'
                            ? 'bg-purple-50 text-purple-700 font-semibold'
                            : app.status === 'Applied'
                            ? 'bg-indigo-50 text-indigo-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {app.status}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap font-mono text-[11px] text-slate-600">
                      {formatDate(app.applicationDeadline)}
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap font-mono text-[11px] text-slate-600">
                      {formatDate(app.dateApplied)}
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap">
                      {app.referralContactId ? (
                        <span className="text-emerald-700 font-semibold text-[11px]">
                          ✓ Referral Active
                        </span>
                      ) : app.associatedContactIds.length > 0 ? (
                        <span className="text-slate-600 text-[11px]">
                          {app.associatedContactIds.length} Linked Contact(s)
                        </span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap text-slate-600 max-w-xs truncate">
                      {app.nextAction || '—'}
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap text-right">
                      <div
                        className="flex items-center justify-end gap-1.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => setEditingApp(app)}
                          className="p-1 text-slate-400 hover:text-blue-600 rounded"
                          title="Edit"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete application for ${app.bank}?`)) {
                              deleteApplication(app.id);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded"
                          title="Delete"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. CALENDAR VIEW */}
      {viewMode === 'calendar' && (
        <div className="bg-white rounded border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h3 className="text-sm font-bold text-slate-900">
              Recruiting Deadlines & Interview Schedule (November - December 2026)
            </h3>
            <span className="text-xs text-slate-500 font-mono">Cycle: Summer 2027</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {state.applications
              .sort((a, b) => a.applicationDeadline.localeCompare(b.applicationDeadline))
              .map((app) => (
                <div
                  key={app.id}
                  onClick={() => setSelectedAppId(app.id)}
                  className="p-3.5 rounded border border-slate-200 bg-slate-50 hover:bg-white hover:border-blue-400 transition-all cursor-pointer text-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{app.bank}</span>
                    <span className="font-mono text-[11px] font-semibold text-slate-600">
                      {formatDate(app.applicationDeadline)}
                    </span>
                  </div>

                  <div className="text-slate-600">{app.positionTitle}</div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-200 text-[11px]">
                    <span className="font-medium text-slate-700">{app.status}</span>
                    {app.interviewDates.length > 0 && (
                      <span className="text-purple-700 font-semibold">
                        Interview: {formatDate(app.interviewDates[0])}
                      </span>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Application Detail Drawer / Modal */}
      {selectedApp && (
        <div className="bg-white rounded border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">{selectedApp.bank}</h2>
                <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded font-medium">
                  {selectedApp.status}
                </span>
                <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-700 rounded">
                  {selectedApp.firmType}
                </span>
              </div>
              <div className="text-xs text-slate-600 mt-1">
                {selectedApp.positionTitle} · {selectedApp.group} · {selectedApp.location}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {selectedApp.applicationUrl && (
                <a
                  href={selectedApp.applicationUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink size={13} />
                  <span>Open Portal</span>
                </a>
              )}
              <button
                onClick={() => setEditingApp(selectedApp)}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-medium flex items-center gap-1 transition-colors"
              >
                <Edit2 size={13} />
                <span>Edit Application</span>
              </button>
              <button
                onClick={() => setSelectedAppId(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs bg-slate-50/70 p-4 rounded border border-slate-200">
            <div>
              <div className="text-slate-400 font-medium uppercase text-[10px]">Application Deadline</div>
              <div className="font-mono text-slate-800 font-semibold mt-0.5">
                {formatDate(selectedApp.applicationDeadline)}
              </div>
            </div>
            <div>
              <div className="text-slate-400 font-medium uppercase text-[10px]">Date Applied</div>
              <div className="font-mono text-slate-800 mt-0.5">
                {formatDate(selectedApp.dateApplied)}
              </div>
            </div>
            <div>
              <div className="text-slate-400 font-medium uppercase text-[10px]">Resume Version</div>
              <div className="text-slate-800 mt-0.5 truncate">{selectedApp.resumeVersionUsed || 'Standard'}</div>
            </div>
            <div>
              <div className="text-slate-400 font-medium uppercase text-[10px]">Recruiter Contact</div>
              <div className="text-slate-800 mt-0.5 truncate">{selectedApp.recruiterContact || '—'}</div>
            </div>
          </div>

          {/* Next Action Box */}
          {selectedApp.nextAction && (
            <div className="p-3 bg-amber-50/60 rounded border border-amber-200/80 text-xs text-amber-950 flex items-center justify-between">
              <div>
                <strong className="block text-amber-900">Next Action:</strong>
                <span>{selectedApp.nextAction}</span>
              </div>
              {selectedApp.nextActionDeadline && (
                <span className="font-mono text-[11px] font-semibold text-amber-800 shrink-0">
                  Target: {formatDate(selectedApp.nextActionDeadline)}
                </span>
              )}
            </div>
          )}

          {/* Associated Networking Contacts for this Bank */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Associated Networking Contacts ({selectedBankContacts.length})
              </h3>
            </div>

            {selectedBankContacts.length === 0 ? (
              <div className="p-4 bg-slate-50 rounded border border-slate-200 text-xs text-slate-500">
                No networking contacts linked yet for {selectedApp.bank}. Head over to the Networking CRM to add contacts.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {selectedBankContacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="p-3 rounded border border-slate-200 bg-white shadow-2xs text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{contact.fullName}</span>
                      <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                        {contact.seniority}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {contact.group} · {contact.location}
                    </div>
                    <div className="text-[11px] text-slate-600 flex items-center justify-between pt-1 border-t border-slate-100">
                      <span>Status: {contact.connectionStatus}</span>
                      <span className="font-mono text-[10px]">Lvl {contact.relationshipStrength}/5</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Associated Networking Conversations */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
              Bank Conversation History ({selectedBankInteractions.length})
            </h3>
            {selectedBankInteractions.length === 0 ? (
              <div className="text-xs text-slate-400 italic">No touchpoints recorded yet with contacts at {selectedApp.bank}.</div>
            ) : (
              <div className="space-y-2">
                {selectedBankInteractions.map((intItem) => (
                  <div key={intItem.id} className="p-3 bg-slate-50 rounded border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center justify-between font-semibold text-slate-900">
                      <span>{intItem.interactionType} ({intItem.durationMinutes}m)</span>
                      <span className="font-mono text-slate-500 font-normal">{formatDate(intItem.date)}</span>
                    </div>
                    <p className="text-slate-700">{intItem.keyTakeaways}</p>
                    {intItem.adviceReceived && (
                      <p className="text-blue-900 text-[11px]"><strong>Advice:</strong> {intItem.adviceReceived}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Application Modal */}
      {editingApp && (
        <ApplicationModal
          application={editingApp}
          onClose={() => setEditingApp(null)}
          onSave={async (saved) => {
            await saveApplication(saved);
            setEditingApp(null);
          }}
        />
      )}
    </div>
  );
};

// Sub-component: Application Create / Edit Modal
export const ApplicationModal: React.FC<{
  application: Partial<Application>;
  onClose: () => void;
  onSave: (a: Partial<Application>) => Promise<void>;
}> = ({ application, onClose, onSave }) => {
  const { state } = useApp();

  const [formData, setFormData] = useState<Partial<Application>>({
    bank: application.bank || 'Evercore',
    firmType: application.firmType || 'Elite Boutique',
    positionTitle: application.positionTitle || '2027 Summer Analyst - Investment Banking',
    division: application.division || 'Investment Banking',
    group: application.group || 'Generalist M&A',
    internshipProgram: application.internshipProgram || 'Summer Analyst Internship (10 Weeks)',
    location: application.location || 'New York, NY',
    recruitingCycle: application.recruitingCycle || 'Summer 2027',
    applicationUrl: application.applicationUrl || '',
    applicationDeadline: application.applicationDeadline || '2026-12-01',
    dateApplied: application.dateApplied || null,
    status: application.status || 'Interested',
    resumeVersionUsed: application.resumeVersionUsed || state.userProfile.currentResumeVersion,
    coverLetterVersionUsed: application.coverLetterVersionUsed || '',
    referralContactId: application.referralContactId || null,
    associatedContactIds: application.associatedContactIds || [],
    recruiterContact: application.recruiterContact || '',
    interviewDates: application.interviewDates || [],
    notes: application.notes || '',
    nextAction: application.nextAction || '',
    nextActionDeadline: application.nextActionDeadline || null,
    id: application.id,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };

  const toggleAssociatedContact = (cId: string) => {
    const list = formData.associatedContactIds || [];
    if (list.includes(cId)) {
      setFormData({ ...formData, associatedContactIds: list.filter((id) => id !== cId) });
    } else {
      setFormData({ ...formData, associatedContactIds: [...list, cId] });
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl border border-slate-200 max-w-2xl w-full my-8 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0">
          <h3 className="font-bold text-slate-900 text-sm">
            {formData.id ? `Edit Application: ${formData.bank}` : 'Track New Internship Application'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto text-xs">
          {/* Bank & Firm Type */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Bank / Institution *</label>
              <input
                type="text"
                list="bank-suggestions-app"
                required
                value={formData.bank}
                onChange={(e) => setFormData({ ...formData, bank: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
              <datalist id="bank-suggestions-app">
                {IB_BANKS_SUGGESTIONS.map((b) => (
                  <option key={b} value={b} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Firm Type</label>
              <select
                value={formData.firmType}
                onChange={(e) => setFormData({ ...formData, firmType: e.target.value as FirmType })}
                className="w-full px-3 py-1.5 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-600"
              >
                <option value="Bulge Bracket">Bulge Bracket</option>
                <option value="Elite Boutique">Elite Boutique</option>
                <option value="Middle Market">Middle Market</option>
                <option value="Regional Boutique">Regional Boutique</option>
                <option value="Independent Advisory Firm">Independent Advisory Firm</option>
              </select>
            </div>
          </div>

          {/* Position Title & Group */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Position Title *</label>
              <input
                type="text"
                required
                value={formData.positionTitle}
                onChange={(e) => setFormData({ ...formData, positionTitle: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Division & Group</label>
              <input
                type="text"
                value={formData.group}
                onChange={(e) => setFormData({ ...formData, group: e.target.value })}
                placeholder="e.g. Generalist M&A, TMT, Healthcare"
                className="w-full px-3 py-1.5 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>
          </div>

          {/* Location & Recruiting Cycle */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Office Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="New York, NY"
                className="w-full px-3 py-1.5 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Recruiting Cycle</label>
              <input
                type="text"
                value={formData.recruitingCycle}
                onChange={(e) => setFormData({ ...formData, recruitingCycle: e.target.value })}
                placeholder="Summer 2027"
                className="w-full px-3 py-1.5 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>
          </div>

          {/* Status, Deadline, Date Applied */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Recruiting Stage *</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as ApplicationStatus })}
                className="w-full px-3 py-1.5 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-600"
              >
                <option value="Interested">Interested</option>
                <option value="Researching">Researching</option>
                <option value="Networking">Networking</option>
                <option value="Preparing to Apply">Preparing to Apply</option>
                <option value="Applied">Applied</option>
                <option value="Referral Requested">Referral Requested</option>
                <option value="Referral Received">Referral Received</option>
                <option value="Online Assessment">Online Assessment</option>
                <option value="First Round">First Round</option>
                <option value="Superday">Superday</option>
                <option value="Offer">Offer</option>
                <option value="Rejected">Rejected</option>
                <option value="Withdrawn">Withdrawn</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Application Deadline</label>
              <input
                type="date"
                value={formData.applicationDeadline}
                onChange={(e) => setFormData({ ...formData, applicationDeadline: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Date Applied</label>
              <input
                type="date"
                value={formData.dateApplied || ''}
                onChange={(e) => setFormData({ ...formData, dateApplied: e.target.value || null })}
                className="w-full px-3 py-1.5 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>
          </div>

          {/* Application Portal URL */}
          <div>
            <label className="block font-medium text-slate-700 mb-1">Application Portal URL</label>
            <input
              type="url"
              value={formData.applicationUrl}
              onChange={(e) => setFormData({ ...formData, applicationUrl: e.target.value })}
              placeholder="https://..."
              className="w-full px-3 py-1.5 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>

          {/* Associate Networking Contacts */}
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Associate Bankers / Internal Champions
            </label>
            <div className="max-h-32 overflow-y-auto border border-slate-200 rounded p-2 bg-slate-50 space-y-1">
              {state.contacts.map((c) => {
                const isChecked = formData.associatedContactIds?.includes(c.id);
                return (
                  <label key={c.id} className="flex items-center gap-2 text-slate-800 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleAssociatedContact(c.id)}
                      className="rounded text-blue-600"
                    />
                    <span>
                      {c.fullName} ({c.bank} - {c.group})
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Next Action & Notes */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Next Action Required</label>
              <input
                type="text"
                value={formData.nextAction}
                onChange={(e) => setFormData({ ...formData, nextAction: e.target.value })}
                placeholder="e.g. Complete HireVue, Mock Superday"
                className="w-full px-3 py-1.5 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Next Action Target Date</label>
              <input
                type="date"
                value={formData.nextActionDeadline || ''}
                onChange={(e) => setFormData({ ...formData, nextActionDeadline: e.target.value || null })}
                className="w-full px-3 py-1.5 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Application Notes</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Referral details, specific essay answers, interview round info..."
              className="w-full px-3 py-1.5 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>

          {/* Actions */}
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
              Save Application
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
