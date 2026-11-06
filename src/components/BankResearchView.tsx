import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Search,
  Star,
  ExternalLink,
  ChevronRight,
  MapPin,
  Calendar,
  Layers,
  GraduationCap,
  Users,
  AlertCircle,
  Edit2,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BankProfile, FirmType } from '../types';

export const BankResearchView: React.FC = () => {
  const { state, toggleBankTarget, saveBank } = useApp();

  const [selectedFirmType, setSelectedFirmType] = useState<string>('All');
  const [onlyTargets, setOnlyTargets] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedBank, setSelectedBank] = useState<BankProfile | null>(null);
  const [editingBank, setEditingBank] = useState<BankProfile | null>(null);

  const filteredBanks = state.banks.filter((b) => {
    if (selectedFirmType !== 'All' && b.firmType !== selectedFirmType) return false;
    if (onlyTargets && !b.isTarget) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        b.name.toLowerCase().includes(q) ||
        b.headquarters.toLowerCase().includes(q) ||
        b.notableGroups.some((g) => g.toLowerCase().includes(q)) ||
        b.keyOffices.some((o) => o.toLowerCase().includes(q)) ||
        b.cultureNotes.toLowerCase().includes(q) ||
        b.researchNotes.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Bank & Firm Research Database
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Profiles, industry groups, technical interview rigor, culture notes, and recruiting timelines
          </p>
        </div>

        <button
          onClick={() =>
            setEditingBank({
              id: '',
              name: '',
              firmType: 'Bulge Bracket',
              headquarters: 'New York, NY',
              keyOffices: ['New York'],
              notableGroups: ['M&A'],
              recruitingTimeline: '',
              internshipProgram: 'Summer Analyst Program',
              applicationUrl: '',
              keyRecruitingContacts: '',
              networkingNotes: '',
              cultureNotes: '',
              interviewProcess: '',
              technicalDifficulty: 'Standard',
              researchNotes: '',
              isTarget: true,
              priorityTier: 'Tier 2 (Target)',
            })
          }
          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors whitespace-nowrap self-start sm:self-auto"
        >
          <Plus size={14} />
          <span>Add Custom Bank</span>
        </button>
      </div>

      {/* Filter and Target Toggles */}
      <div className="bg-white p-3.5 rounded border border-slate-200 shadow-sm space-y-3 text-xs">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by bank name, group (M&A, Healthcare, RX), or office location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <select
              value={selectedFirmType}
              onChange={(e) => setSelectedFirmType(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-slate-700 focus:outline-none"
            >
              <option value="All">All Firm Types</option>
              <option value="Bulge Bracket">Bulge Bracket</option>
              <option value="Elite Boutique">Elite Boutique</option>
              <option value="Middle Market">Middle Market</option>
              <option value="Regional Boutique">Regional Boutique</option>
            </select>

            <label className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded cursor-pointer font-medium text-slate-700">
              <input
                type="checkbox"
                checked={onlyTargets}
                onChange={(e) => setOnlyTargets(e.target.checked)}
                className="rounded text-blue-600"
              />
              <span>Target List Only</span>
            </label>
          </div>
        </div>
      </div>

      {/* Banks Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBanks.map((bank) => {
          const linkedContacts = state.contacts.filter(
            (c) => c.bank.toLowerCase() === bank.name.toLowerCase()
          );
          const activeApp = state.applications.find(
            (a) => a.bank.toLowerCase() === bank.name.toLowerCase()
          );

          return (
            <div
              key={bank.id}
              onClick={() => setSelectedBank(bank)}
              className="bg-white rounded border border-slate-200 p-5 shadow-2xs hover:border-blue-400 hover:shadow-sm cursor-pointer transition-all flex flex-col justify-between space-y-4 text-xs"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                      <span>{bank.name}</span>
                    </h3>
                    <div className="text-[11px] text-slate-500 font-medium">{bank.firmType}</div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleBankTarget(bank.id);
                    }}
                    className={`p-1.5 rounded transition-colors ${
                      bank.isTarget ? 'text-amber-500 bg-amber-50' : 'text-slate-300 hover:text-slate-500'
                    }`}
                    title={bank.isTarget ? 'On Target List' : 'Add to Target List'}
                  >
                    <Star size={16} fill={bank.isTarget ? 'currentColor' : 'none'} />
                  </button>
                </div>

                {/* Priority Tier & Technical Difficulty */}
                <div className="flex items-center gap-2 mt-2 text-[11px]">
                  <span
                    className={`px-2 py-0.5 rounded font-semibold ${
                      bank.priorityTier.includes('Tier 1')
                        ? 'bg-purple-50 text-purple-700'
                        : bank.priorityTier.includes('Tier 2')
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {bank.priorityTier}
                  </span>
                  <span className="text-slate-400">·</span>
                  <span className="text-slate-600">Tech Rigor: {bank.technicalDifficulty}</span>
                </div>

                {/* Notable Groups */}
                <div className="mt-3">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
                    Notable Groups
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {bank.notableGroups.slice(0, 3).map((g) => (
                      <span
                        key={g}
                        className="bg-slate-50 border border-slate-200 text-slate-700 text-[10px] px-1.5 py-0.5 rounded"
                      >
                        {g}
                      </span>
                    ))}
                    {bank.notableGroups.length > 3 && (
                      <span className="text-[10px] text-slate-400">+{bank.notableGroups.length - 3}</span>
                    )}
                  </div>
                </div>

                {/* Culture notes preview */}
                <p className="text-slate-600 line-clamp-2 mt-3 leading-relaxed">{bank.cultureNotes}</p>
              </div>

              {/* Card Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="font-semibold text-slate-700">
                  {linkedContacts.length} Banker{linkedContacts.length === 1 ? '' : 's'} in CRM
                </span>
                {activeApp ? (
                  <span className="text-blue-700 font-semibold font-mono">
                    App: {activeApp.status}
                  </span>
                ) : (
                  <span className="text-slate-400">Not Applied Yet</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bank Profile Drawer / Modal */}
      {selectedBank && (
        <div className="bg-white rounded border border-slate-200 p-6 shadow-sm space-y-5 text-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">{selectedBank.name}</h2>
                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded font-medium">
                  {selectedBank.firmType}
                </span>
                <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded font-semibold">
                  {selectedBank.priorityTier}
                </span>
              </div>
              <div className="text-slate-500 mt-0.5">
                HQ: {selectedBank.headquarters} · Technical Difficulty: {selectedBank.technicalDifficulty}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {selectedBank.applicationUrl && (
                <a
                  href={selectedBank.applicationUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-medium flex items-center gap-1.5"
                >
                  <ExternalLink size={13} />
                  <span>Careers Portal</span>
                </a>
              )}
              <button
                onClick={() => setEditingBank(selectedBank)}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded font-medium"
              >
                Edit Profile
              </button>
              <button
                onClick={() => setSelectedBank(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1">
              <strong className="text-slate-900 block text-[11px]">Recruiting Timeline & Process</strong>
              <p className="text-slate-700 whitespace-pre-line">{selectedBank.recruitingTimeline}</p>
              <div className="mt-2 pt-2 border-t border-slate-200 text-slate-600">
                <strong>Interview Rounds:</strong>
                <p className="whitespace-pre-line mt-0.5">{selectedBank.interviewProcess}</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1">
              <strong className="text-slate-900 block text-[11px]">Culture & Junior Banker Experience</strong>
              <p className="text-slate-700 whitespace-pre-line">{selectedBank.cultureNotes}</p>
              <div className="mt-2 pt-2 border-t border-slate-200 text-slate-600">
                <strong>Key Offices:</strong> {selectedBank.keyOffices.join(', ')}
              </div>
            </div>

            <div className="p-3 bg-blue-50/50 rounded border border-blue-200 col-span-2 space-y-1">
              <strong className="text-blue-950 block text-[11px]">Networking & Research Intel</strong>
              <p className="text-blue-900 whitespace-pre-line">{selectedBank.networkingNotes}</p>
              {selectedBank.researchNotes && (
                <p className="text-blue-800 text-[11px] mt-1.5 pt-1.5 border-t border-blue-200">
                  <strong>Notable Mandates & League Table Position:</strong> {selectedBank.researchNotes}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Bank Modal */}
      {editingBank && (
        <BankModal
          bank={editingBank}
          onClose={() => setEditingBank(null)}
          onSave={async (saved) => {
            await saveBank(saved);
            setEditingBank(null);
            if (selectedBank?.id === saved.id) setSelectedBank(saved as BankProfile);
          }}
        />
      )}
    </div>
  );
};

// Subcomponent: Edit Bank Profile Modal
const BankModal: React.FC<{
  bank: Partial<BankProfile>;
  onClose: () => void;
  onSave: (b: Partial<BankProfile>) => Promise<void>;
}> = ({ bank, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<BankProfile>>({
    name: bank.name || '',
    firmType: bank.firmType || 'Bulge Bracket',
    headquarters: bank.headquarters || 'New York, NY',
    keyOffices: bank.keyOffices || ['New York'],
    notableGroups: bank.notableGroups || ['M&A'],
    recruitingTimeline: bank.recruitingTimeline || '',
    internshipProgram: bank.internshipProgram || 'Summer Analyst Program',
    applicationUrl: bank.applicationUrl || '',
    keyRecruitingContacts: bank.keyRecruitingContacts || '',
    networkingNotes: bank.networkingNotes || '',
    cultureNotes: bank.cultureNotes || '',
    interviewProcess: bank.interviewProcess || '',
    technicalDifficulty: bank.technicalDifficulty || 'Standard',
    researchNotes: bank.researchNotes || '',
    isTarget: bank.isTarget ?? true,
    priorityTier: bank.priorityTier || 'Tier 2 (Target)',
    id: bank.id,
  });

  const [officeText, setOfficeText] = useState(formData.keyOffices?.join(', ') || '');
  const [groupText, setGroupText] = useState(formData.notableGroups?.join(', ') || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({
      ...formData,
      keyOffices: officeText.split(',').map((s) => s.trim()).filter(Boolean),
      notableGroups: groupText.split(',').map((s) => s.trim()).filter(Boolean),
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl border border-slate-200 max-w-2xl w-full my-8 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0">
          <h3 className="font-bold text-slate-900 text-sm">
            {formData.id ? `Edit Profile: ${formData.name}` : 'Add Investment Bank Profile'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Bank Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
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

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Priority Tier</label>
              <select
                value={formData.priorityTier}
                onChange={(e) => setFormData({ ...formData, priorityTier: e.target.value as any })}
                className="w-full px-3 py-1.5 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-600"
              >
                <option value="Tier 1 (Dream)">Tier 1 (Dream)</option>
                <option value="Tier 2 (Target)">Tier 2 (Target)</option>
                <option value="Tier 3 (Safety / Select)">Tier 3 (Safety / Select)</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Technical Difficulty</label>
              <select
                value={formData.technicalDifficulty}
                onChange={(e) =>
                  setFormData({ ...formData, technicalDifficulty: e.target.value as any })
                }
                className="w-full px-3 py-1.5 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-600"
              >
                <option value="Standard">Standard</option>
                <option value="High">High</option>
                <option value="Very High">Very High</option>
                <option value="Rigorous Modeling">Rigorous Modeling</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Target Status</label>
              <select
                value={formData.isTarget ? 'yes' : 'no'}
                onChange={(e) => setFormData({ ...formData, isTarget: e.target.value === 'yes' })}
                className="w-full px-3 py-1.5 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-600"
              >
                <option value="yes">Saved to Target List</option>
                <option value="no">Not on Target List</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Key Offices (comma separated)</label>
              <input
                type="text"
                value={officeText}
                onChange={(e) => setOfficeText(e.target.value)}
                placeholder="New York, San Francisco, Chicago"
                className="w-full px-3 py-1.5 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Notable Groups (comma separated)</label>
              <input
                type="text"
                value={groupText}
                onChange={(e) => setGroupText(e.target.value)}
                placeholder="M&A, Restructuring, TMT, Healthcare"
                className="w-full px-3 py-1.5 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Recruiting Timeline & Interview Rounds</label>
            <textarea
              rows={2}
              value={formData.recruitingTimeline}
              onChange={(e) => setFormData({ ...formData, recruitingTimeline: e.target.value })}
              className="w-full px-3 py-1.5 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Culture & Networking Intel</label>
            <textarea
              rows={3}
              value={formData.cultureNotes}
              onChange={(e) => setFormData({ ...formData, cultureNotes: e.target.value })}
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
              Save Bank Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
