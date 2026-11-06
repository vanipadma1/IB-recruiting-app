import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  PhoneCall,
  Mail,
  Linkedin,
  Calendar,
  Clock,
  ChevronRight,
  ExternalLink,
  Edit2,
  Trash2,
  Star,
  CheckCircle2,
  AlertCircle,
  FileText,
  Filter,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Contact, Interaction, InteractionType, Seniority, FirmType, ConnectionStatus } from '../types';
import { formatDate, isPastDate, isToday, IB_BANKS_SUGGESTIONS, IB_GROUPS_SUGGESTIONS } from '../utils/helpers';

export const CrmView: React.FC<{
  onOpenQuickAddContact: () => void;
  onOpenQuickAddInteraction: (contactId?: string) => void;
}> = ({ onOpenQuickAddContact, onOpenQuickAddInteraction }) => {
  const { state, filters, setFilters, deleteContact, deleteInteraction, saveContact, saveInteraction } = useApp();

  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [newInteractionForContact, setNewInteractionForContact] = useState<string | null>(null);

  // Filter States
  const [selectedBank, setSelectedBank] = useState<string>(filters.crmBank || 'All');
  const [selectedSeniority, setSelectedSeniority] = useState<string>(filters.crmSeniority || 'All');
  const [selectedStatus, setSelectedStatus] = useState<string>(filters.crmStatus || 'All');
  const [selectedStrength, setSelectedStrength] = useState<string>('All');
  const [followUpFilter, setFollowUpFilter] = useState<'All' | 'Overdue' | 'DueWeek'>('All');
  const [searchQuery, setSearchQuery] = useState<string>(filters.crmSearch || '');

  // Distinct banks and schools for filter dropdowns
  const uniqueBanks = Array.from(new Set(state.contacts.map((c) => c.bank))).sort();
  const uniqueSchools = Array.from(new Set(state.contacts.map((c) => c.school))).filter(Boolean).sort();

  // Filter logic
  const filteredContacts = state.contacts.filter((c) => {
    if (selectedBank !== 'All' && c.bank !== selectedBank) return false;
    if (selectedSeniority !== 'All' && c.seniority !== selectedSeniority) return false;
    if (selectedStatus !== 'All' && c.connectionStatus !== selectedStatus) return false;
    if (selectedStrength !== 'All' && c.relationshipStrength.toString() !== selectedStrength) return false;

    if (filters.crmFollowUpDueOnly) {
      if (!c.nextFollowUpDate) return false;
      const today = new Date().toISOString().split('T')[0];
      if (c.nextFollowUpDate > today) return false;
    }

    if (followUpFilter === 'Overdue') {
      if (!c.nextFollowUpDate || !isPastDate(c.nextFollowUpDate)) return false;
    } else if (followUpFilter === 'DueWeek') {
      if (!c.nextFollowUpDate) return false;
      const today = new Date();
      const target = new Date(c.nextFollowUpDate);
      const diffDays = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays < 0 || diffDays > 7) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        c.fullName.toLowerCase().includes(q) ||
        c.bank.toLowerCase().includes(q) ||
        c.group.toLowerCase().includes(q) ||
        c.jobTitle.toLowerCase().includes(q) ||
        c.school.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.notes && c.notes.toLowerCase().includes(q)) ||
        c.tags.some((t) => t.toLowerCase().includes(q));
      if (!match) return false;
    }

    return true;
  });

  const selectedContact = state.contacts.find((c) => c.id === selectedContactId);
  const selectedInteractions = selectedContactId
    ? state.interactions
        .filter((i) => i.contactId === selectedContactId)
        .sort((a, b) => b.date.localeCompare(a.date))
    : [];

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-12">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Investment Banking Networking CRM
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track bankers, information interviews, relationship strength, and follow-up deadlines
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenQuickAddContact()}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Plus size={14} />
            <span>Add Banker Contact</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, bank, group (M&A, TMT, RX), school, or notes..."
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

          {/* Quick Filter Selects */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Bank Filter */}
            <select
              value={selectedBank}
              onChange={(e) => setSelectedBank(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded text-slate-700 focus:outline-none focus:bg-white"
            >
              <option value="All">All Banks ({uniqueBanks.length})</option>
              {uniqueBanks.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>

            {/* Seniority Filter */}
            <select
              value={selectedSeniority}
              onChange={(e) => setSelectedSeniority(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded text-slate-700 focus:outline-none focus:bg-white"
            >
              <option value="All">All Seniorities</option>
              <option value="Analyst">Analyst</option>
              <option value="Associate">Associate</option>
              <option value="VP">Vice President (VP)</option>
              <option value="Director">Director / ED</option>
              <option value="MD">Managing Director (MD)</option>
              <option value="Recruiter">Recruiter</option>
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded text-slate-700 focus:outline-none focus:bg-white"
            >
              <option value="All">All Statuses</option>
              <option value="Identified">Identified</option>
              <option value="Outreach Sent">Outreach Sent</option>
              <option value="Connected">Connected</option>
              <option value="Call Scheduled">Call Scheduled</option>
              <option value="Spoke">Spoke</option>
              <option value="Warm Relationship">Warm Relationship</option>
              <option value="Strong Advocate">Strong Advocate</option>
              <option value="Unresponsive">Unresponsive</option>
            </select>

            {/* Follow-up Quick filter */}
            <select
              value={followUpFilter}
              onChange={(e) => setFollowUpFilter(e.target.value as any)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded text-slate-700 focus:outline-none focus:bg-white"
            >
              <option value="All">Follow-Up: Any</option>
              <option value="Overdue">Follow-Up: Overdue</option>
              <option value="DueWeek">Follow-Up: Next 7 Days</option>
            </select>

            {(selectedBank !== 'All' ||
              selectedSeniority !== 'All' ||
              selectedStatus !== 'All' ||
              followUpFilter !== 'All' ||
              searchQuery ||
              filters.crmFollowUpDueOnly) && (
              <button
                onClick={() => {
                  setSelectedBank('All');
                  setSelectedSeniority('All');
                  setSelectedStatus('All');
                  setFollowUpFilter('All');
                  setSearchQuery('');
                  setFilters((prev) => ({ ...prev, crmBank: undefined, crmFollowUpDueOnly: false }));
                }}
                className="px-2 py-1.5 text-xs text-rose-600 hover:text-rose-800 font-medium"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Results Count & Subtitle */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
          <span>
            Showing <strong className="text-slate-800">{filteredContacts.length}</strong> of{' '}
            {state.contacts.length} total contacts
          </span>
          <span className="hidden sm:inline">
            Tip: Click a contact row to inspect interaction log and history
          </span>
        </div>
      </div>

      {/* Main CRM Table View */}
      <div className="bg-white rounded border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-2.5 px-3">Banker Name</th>
                <th className="py-2.5 px-3">Bank & Firm Type</th>
                <th className="py-2.5 px-3">Group / Division</th>
                <th className="py-2.5 px-3">Title & Seniority</th>
                <th className="py-2.5 px-3">School</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-center">Strength</th>
                <th className="py-2.5 px-3">Last Contact</th>
                <th className="py-2.5 px-3">Next Follow-Up</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredContacts.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <Users size={32} className="mx-auto text-slate-300 mb-2" />
                    <div className="font-medium text-slate-600">No contacts match your filters</div>
                    <div className="text-xs text-slate-400 mt-1">
                      Try clearing filters or click "+ Add Banker Contact" to log someone new.
                    </div>
                  </td>
                </tr>
              ) : (
                filteredContacts.map((contact) => {
                  const isSelected = selectedContactId === contact.id;
                  const contactInteractions = state.interactions.filter(
                    (i) => i.contactId === contact.id
                  );
                  const isOverdue = isPastDate(contact.nextFollowUpDate);
                  const isDueToday = isToday(contact.nextFollowUpDate);

                  return (
                    <tr
                      key={contact.id}
                      onClick={() => setSelectedContactId(contact.id)}
                      className={`hover:bg-blue-50/40 cursor-pointer transition-colors ${
                        isSelected ? 'bg-blue-50/70 font-medium' : ''
                      }`}
                    >
                      {/* Name & Contact icons */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                          <span>{contact.fullName}</span>
                          {contact.linkedinUrl && (
                            <a
                              href={contact.linkedinUrl}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-slate-400 hover:text-blue-600"
                              title="LinkedIn profile"
                            >
                              <Linkedin size={13} />
                            </a>
                          )}
                          {contact.email && (
                            <a
                              href={`mailto:${contact.email}`}
                              onClick={(e) => e.stopPropagation()}
                              className="text-slate-400 hover:text-blue-600"
                              title={contact.email}
                            >
                              <Mail size={13} />
                            </a>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500">{contact.location}</div>
                      </td>

                      {/* Bank & Firm Type */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="font-medium text-slate-900">{contact.bank}</div>
                        <div className="text-[10px] text-slate-500">{contact.firmType}</div>
                      </td>

                      {/* Group */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="text-slate-800 font-medium">{contact.group}</div>
                        <div className="text-[10px] text-slate-500">{contact.division}</div>
                      </td>

                      {/* Seniority */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="text-slate-800">{contact.jobTitle}</div>
                        <div className="text-[10px] text-slate-500">{contact.seniority}</div>
                      </td>

                      {/* School & Year */}
                      <td className="py-2.5 px-3 whitespace-nowrap text-slate-600">
                        <div>{contact.school}</div>
                        {contact.gradYear && (
                          <div className="text-[10px] font-mono text-slate-400">
                            '{contact.gradYear.toString().slice(-2)}
                          </div>
                        )}
                      </td>

                      {/* Connection Status */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${
                            contact.connectionStatus === 'Strong Advocate'
                              ? 'bg-emerald-50 text-emerald-700 font-semibold'
                              : contact.connectionStatus === 'Warm Relationship'
                              ? 'bg-blue-50 text-blue-700'
                              : contact.connectionStatus === 'Call Scheduled'
                              ? 'bg-purple-50 text-purple-700'
                              : contact.connectionStatus === 'Spoke'
                              ? 'bg-slate-100 text-slate-700'
                              : 'bg-slate-50 text-slate-500'
                          }`}
                        >
                          {contact.connectionStatus}
                        </span>
                      </td>

                      {/* Relationship Strength (1-5 visual) */}
                      <td className="py-2.5 px-3 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((lvl) => (
                            <span
                              key={lvl}
                              className={`w-1.5 h-3.5 rounded-xs ${
                                lvl <= contact.relationshipStrength
                                  ? contact.relationshipStrength >= 4
                                    ? 'bg-emerald-500'
                                    : 'bg-blue-600'
                                  : 'bg-slate-200'
                              }`}
                              title={`Strength: ${contact.relationshipStrength}/5`}
                            />
                          ))}
                        </div>
                      </td>

                      {/* Last Contact */}
                      <td className="py-2.5 px-3 whitespace-nowrap font-mono text-[11px] text-slate-600">
                        {formatDate(contact.lastContactedDate)}
                        <div className="text-[10px] text-slate-400 font-sans">
                          {contactInteractions.length} touchpoint{contactInteractions.length === 1 ? '' : 's'}
                        </div>
                      </td>

                      {/* Next Follow Up */}
                      <td className="py-2.5 px-3 whitespace-nowrap font-mono text-[11px]">
                        {contact.nextFollowUpDate ? (
                          <span
                            className={
                              isOverdue
                                ? 'text-rose-600 font-bold'
                                : isDueToday
                                ? 'text-amber-600 font-bold'
                                : 'text-slate-600'
                            }
                          >
                            {formatDate(contact.nextFollowUpDate)}
                            {isOverdue && <span className="block text-[9px] uppercase font-sans">Overdue</span>}
                            {isDueToday && <span className="block text-[9px] uppercase font-sans">Today</span>}
                          </span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>

                      {/* Quick Actions */}
                      <td className="py-2.5 px-3 whitespace-nowrap text-right">
                        <div
                          className="flex items-center justify-end gap-1.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => onOpenQuickAddInteraction(contact.id)}
                            className="p-1 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded"
                            title="Log new interaction"
                          >
                            <PhoneCall size={14} />
                          </button>
                          <button
                            onClick={() => setEditingContact(contact)}
                            className="p-1 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded"
                            title="Edit Contact"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete contact ${contact.fullName}?`)) {
                                deleteContact(contact.id);
                                if (selectedContactId === contact.id) setSelectedContactId(null);
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Contact Details & Interaction History Drawer / Modal */}
      {selectedContact && (
        <div className="bg-white rounded border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">{selectedContact.fullName}</h2>
                <span className="text-xs px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-medium">
                  {selectedContact.seniority}
                </span>
                <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded font-medium">
                  {selectedContact.connectionStatus}
                </span>
              </div>
              <div className="text-xs text-slate-600 mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="font-semibold text-slate-900">{selectedContact.bank}</span>
                <span>·</span>
                <span>{selectedContact.division}</span>
                <span>·</span>
                <span>{selectedContact.group}</span>
                <span>·</span>
                <span>{selectedContact.location}</span>
                {selectedContact.school && (
                  <>
                    <span>·</span>
                    <span>{selectedContact.school} ('{selectedContact.gradYear})</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenQuickAddInteraction(selectedContact.id)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <PhoneCall size={14} />
                <span>Log New Conversation</span>
              </button>
              <button
                onClick={() => setEditingContact(selectedContact)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-medium flex items-center gap-1 transition-colors"
              >
                <Edit2 size={13} />
                <span>Edit Profile</span>
              </button>
              <button
                onClick={() => setSelectedContactId(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded"
                title="Close drawer"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Contact Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs bg-slate-50/70 p-4 rounded border border-slate-200">
            <div>
              <div className="text-slate-400 font-medium uppercase text-[10px]">Email</div>
              <div className="font-mono text-slate-800 mt-0.5 select-all">
                {selectedContact.email || '—'}
              </div>
            </div>
            <div>
              <div className="text-slate-400 font-medium uppercase text-[10px]">How Found</div>
              <div className="text-slate-800 mt-0.5">{selectedContact.howFound || '—'}</div>
            </div>
            <div>
              <div className="text-slate-400 font-medium uppercase text-[10px]">Referral Source</div>
              <div className="text-slate-800 mt-0.5">{selectedContact.referralSource || '—'}</div>
            </div>
            <div>
              <div className="text-slate-400 font-medium uppercase text-[10px]">Relationship Strength</div>
              <div className="text-slate-800 mt-0.5 font-semibold">
                Level {selectedContact.relationshipStrength} of 5
                {selectedContact.relationshipStrength >= 4 ? ' (Internal Champion)' : ' (Developing)'}
              </div>
            </div>
          </div>

          {/* Notes and Tags */}
          {selectedContact.notes && (
            <div className="bg-amber-50/60 p-3.5 rounded border border-amber-200/80 text-xs text-amber-900">
              <span className="font-semibold block mb-0.5 text-amber-950">Banker Notes:</span>
              <p className="whitespace-pre-line leading-relaxed">{selectedContact.notes}</p>
            </div>
          )}

          {/* Complete Chronological Interaction History */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                Interaction History ({selectedInteractions.length} Total Conversations)
              </h3>
              <button
                onClick={() => onOpenQuickAddInteraction(selectedContact.id)}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                + Add Another Touchpoint
              </button>
            </div>

            {selectedInteractions.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded border border-dashed border-slate-200 text-xs text-slate-500">
                <Clock size={24} className="mx-auto text-slate-400 mb-1.5" />
                No conversations logged yet with {selectedContact.fullName}.
                <div className="mt-2">
                  <button
                    onClick={() => onOpenQuickAddInteraction(selectedContact.id)}
                    className="px-2.5 py-1 bg-white border border-slate-300 rounded font-medium text-slate-700 hover:bg-slate-100"
                  >
                    Log First Call / Coffee Chat
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedInteractions.map((interaction, idx) => (
                  <div
                    key={interaction.id}
                    className="p-4 rounded border border-slate-200 bg-white shadow-2xs space-y-3"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">
                          {interaction.interactionType}
                        </span>
                        <span className="text-slate-400">·</span>
                        <span className="font-mono text-slate-600">
                          {formatDate(interaction.date)}
                        </span>
                        <span className="text-slate-400">·</span>
                        <span className="text-slate-500 font-mono">
                          {interaction.durationMinutes} minutes
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {interaction.thankYouEmailSent ? (
                          <span className="flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium">
                            <CheckCircle2 size={12} />
                            <span>Thank-You Sent</span>
                          </span>
                        ) : (
                          <span className="text-[11px] text-rose-700 bg-rose-50 px-2 py-0.5 rounded font-medium">
                            No Thank-You Sent
                          </span>
                        )}
                        <button
                          onClick={() => {
                            if (confirm('Delete this interaction?')) {
                              deleteInteraction(interaction.id);
                            }
                          }}
                          className="text-slate-400 hover:text-rose-600 p-1"
                          title="Delete conversation"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Interaction Content Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      {interaction.keyTakeaways && (
                        <div className="p-2.5 bg-slate-50 rounded">
                          <span className="font-semibold text-slate-900 block text-[11px] mb-0.5">
                            Key Takeaways
                          </span>
                          <p className="text-slate-700 leading-relaxed">
                            {interaction.keyTakeaways}
                          </p>
                        </div>
                      )}

                      {interaction.adviceReceived && (
                        <div className="p-2.5 bg-blue-50/50 rounded border border-blue-100">
                          <span className="font-semibold text-blue-950 block text-[11px] mb-0.5">
                            Advice Received
                          </span>
                          <p className="text-blue-900 leading-relaxed">
                            {interaction.adviceReceived}
                          </p>
                        </div>
                      )}

                      {interaction.personalDetails && (
                        <div className="p-2.5 bg-slate-50 rounded">
                          <span className="font-semibold text-slate-900 block text-[11px] mb-0.5">
                            Personal Details (To Remember)
                          </span>
                          <p className="text-slate-700 leading-relaxed">
                            {interaction.personalDetails}
                          </p>
                        </div>
                      )}

                      {interaction.recruitingInsights && (
                        <div className="p-2.5 bg-purple-50/50 rounded border border-purple-100">
                          <span className="font-semibold text-purple-950 block text-[11px] mb-0.5">
                            Recruiting & Group Insights
                          </span>
                          <p className="text-purple-900 leading-relaxed">
                            {interaction.recruitingInsights}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Follow-up action */}
                    {interaction.followUpAction && (
                      <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 text-slate-600">
                        <div>
                          <strong className="text-slate-800">Next Action:</strong>{' '}
                          {interaction.followUpAction}
                        </div>
                        {interaction.followUpDeadline && (
                          <div className="font-mono text-[11px] text-amber-700">
                            Due: {formatDate(interaction.followUpDeadline)}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Contact Modal */}
      {editingContact && (
        <ContactModal
          contact={editingContact}
          onClose={() => setEditingContact(null)}
          onSave={async (saved) => {
            await saveContact(saved);
            setEditingContact(null);
          }}
        />
      )}
    </div>
  );
};

// Sub-component: Comprehensive Contact Create / Edit Modal with all 20+ fields
export const ContactModal: React.FC<{
  contact: Partial<Contact>;
  onClose: () => void;
  onSave: (c: Partial<Contact>) => Promise<void>;
}> = ({ contact, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<Contact>>({
    firstName: contact.firstName || '',
    lastName: contact.lastName || '',
    bank: contact.bank || 'Evercore',
    firmType: contact.firmType || 'Elite Boutique',
    division: contact.division || 'Investment Banking',
    group: contact.group || 'Generalist M&A',
    jobTitle: contact.jobTitle || 'Investment Banking Analyst 1',
    seniority: contact.seniority || 'Analyst',
    school: contact.school || 'Wharton / UPenn',
    gradYear: contact.gradYear || 2025,
    location: contact.location || 'New York, NY',
    email: contact.email || '',
    linkedinUrl: contact.linkedinUrl || '',
    howFound: contact.howFound || 'Penn Alumni Database',
    referralSource: contact.referralSource || '',
    connectionStatus: contact.connectionStatus || 'Identified',
    relationshipStrength: contact.relationshipStrength || 2,
    dateAdded: contact.dateAdded || new Date().toISOString().split('T')[0],
    lastContactedDate: contact.lastContactedDate || null,
    nextFollowUpDate: contact.nextFollowUpDate || null,
    notes: contact.notes || '',
    tags: contact.tags || [],
    id: contact.id,
  });

  const [tagInput, setTagInput] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...(formData.tags || []), tagInput.trim()] });
      setTagInput('');
    }
  };

  const removeTag = (t: string) => {
    setFormData({ ...formData, tags: formData.tags?.filter((x) => x !== t) });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl border border-slate-200 max-w-2xl w-full my-8 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0">
          <h3 className="font-bold text-slate-900 text-sm">
            {formData.id ? `Edit Contact: ${formData.firstName} ${formData.lastName}` : 'Add New Banker Contact'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto text-xs">
          {/* Row 1: Name */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">First Name *</label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Last Name *</label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>
          </div>

          {/* Row 2: Bank & Firm Type */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Bank / Firm *</label>
              <input
                type="text"
                list="bank-suggestions"
                required
                value={formData.bank}
                onChange={(e) => setFormData({ ...formData, bank: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
              <datalist id="bank-suggestions">
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

          {/* Row 3: Division & Group */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Division</label>
              <input
                type="text"
                value={formData.division}
                onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Group (M&A, TMT, RX, FIG, etc.)</label>
              <input
                type="text"
                list="group-suggestions"
                value={formData.group}
                onChange={(e) => setFormData({ ...formData, group: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
              <datalist id="group-suggestions">
                {IB_GROUPS_SUGGESTIONS.map((g) => (
                  <option key={g} value={g} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Row 4: Job Title & Seniority */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Job Title</label>
              <input
                type="text"
                value={formData.jobTitle}
                onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Seniority Level *</label>
              <select
                value={formData.seniority}
                onChange={(e) => setFormData({ ...formData, seniority: e.target.value as Seniority })}
                className="w-full px-3 py-1.5 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-600"
              >
                <option value="Analyst">Analyst</option>
                <option value="Associate">Associate</option>
                <option value="VP">Vice President (VP)</option>
                <option value="Director">Director / ED</option>
                <option value="MD">Managing Director (MD)</option>
                <option value="Recruiter">Recruiter / HR</option>
              </select>
            </div>
          </div>

          {/* Row 5: School & Grad Year */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block font-medium text-slate-700 mb-1">School / University</label>
              <input
                type="text"
                value={formData.school}
                onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Graduation Year</label>
              <input
                type="number"
                value={formData.gradYear || ''}
                onChange={(e) => setFormData({ ...formData, gradYear: parseInt(e.target.value, 10) || 0 })}
                className="w-full px-3 py-1.5 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>
          </div>

          {/* Row 6: Location & Email & LinkedIn */}
          <div className="grid grid-cols-3 gap-3">
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
              <label className="block font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="name@bank.com"
                className="w-full px-3 py-1.5 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">LinkedIn URL</label>
              <input
                type="text"
                value={formData.linkedinUrl}
                onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                placeholder="https://linkedin.com/in/..."
                className="w-full px-3 py-1.5 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>
          </div>

          {/* Row 7: How Found & Referral */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">How Found</label>
              <input
                type="text"
                value={formData.howFound}
                onChange={(e) => setFormData({ ...formData, howFound: e.target.value })}
                placeholder="Alumni Database, LinkedIn, Club"
                className="w-full px-3 py-1.5 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Referral Source</label>
              <input
                type="text"
                value={formData.referralSource}
                onChange={(e) => setFormData({ ...formData, referralSource: e.target.value })}
                placeholder="Warm intro via..."
                className="w-full px-3 py-1.5 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>
          </div>

          {/* Row 8: Status & Strength & Follow Up */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Connection Status</label>
              <select
                value={formData.connectionStatus}
                onChange={(e) =>
                  setFormData({ ...formData, connectionStatus: e.target.value as ConnectionStatus })
                }
                className="w-full px-3 py-1.5 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-600"
              >
                <option value="Identified">Identified</option>
                <option value="Outreach Sent">Outreach Sent</option>
                <option value="Connected">Connected</option>
                <option value="Call Scheduled">Call Scheduled</option>
                <option value="Spoke">Spoke</option>
                <option value="Warm Relationship">Warm Relationship</option>
                <option value="Strong Advocate">Strong Advocate</option>
                <option value="Unresponsive">Unresponsive</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Relationship Strength (1-5)
              </label>
              <select
                value={formData.relationshipStrength}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    relationshipStrength: parseInt(e.target.value, 10) as any,
                  })
                }
                className="w-full px-3 py-1.5 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-600"
              >
                <option value={1}>1 - Cold / Initial Outreach</option>
                <option value={2}>2 - Responsive / Connected</option>
                <option value={3}>3 - Spoke Once / Solid Chat</option>
                <option value={4}>4 - Warm Mentor / Multi-Calls</option>
                <option value={5}>5 - Internal Champion (Will push resume)</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Next Follow-Up Date</label>
              <input
                type="date"
                value={formData.nextFollowUpDate || ''}
                onChange={(e) => setFormData({ ...formData, nextFollowUpDate: e.target.value || null })}
                className="w-full px-3 py-1.5 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>
          </div>

          {/* Row 9: Notes */}
          <div>
            <label className="block font-medium text-slate-700 mb-1">Notes & Conversation Background</label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Key talking points, personal details, deal topics, advice..."
              className="w-full px-3 py-1.5 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block font-medium text-slate-700 mb-1">Tags</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {formData.tags?.map((t) => (
                <span
                  key={t}
                  className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] flex items-center gap-1"
                >
                  {t}
                  <button type="button" onClick={() => removeTag(t)} className="text-slate-400 hover:text-slate-600">
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add tag (e.g. M&A, Alumni, Sponsor)..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
                className="flex-1 px-3 py-1.5 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-medium"
              >
                Add
              </button>
            </div>
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
              Save Banker Contact
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
