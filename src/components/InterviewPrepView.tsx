import React, { useState } from 'react';
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  HelpCircle,
  Plus,
  Search,
  ChevronDown,
  ChevronRight,
  Edit2,
  Trash2,
  Award,
  Video,
  Phone,
  Building,
  User,
  Filter,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { InterviewRecord, PrepQuestion, QuestionCategory, QuestionStatus, InterviewRound, InterviewFormat } from '../types';
import { formatDate } from '../utils/helpers';

const CATEGORIES: QuestionCategory[] = [
  'Accounting',
  'Valuation',
  'DCF',
  'Enterprise Value vs. Equity Value',
  'M&A',
  'LBO',
  'Financial Modeling',
  'Behavioral',
  'Market Awareness',
  'Bank-Specific Questions',
];

export const InterviewPrepView: React.FC<{
  onOpenScheduleInterview: () => void;
}> = ({ onOpenScheduleInterview }) => {
  const { state, updatePrepQuestion, deleteInterview, saveInterview } = useApp();

  const [activeTab, setActiveTab] = useState<'questionBank' | 'interviews'>('questionBank');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);

  const [selectedInterview, setSelectedInterview] = useState<InterviewRecord | null>(null);
  const [editingInterview, setEditingInterview] = useState<InterviewRecord | null>(null);

  // Stats on questions
  const totalQuestions = state.prepQuestions.length;
  const confidentCount = state.prepQuestions.filter((q) => q.status === 'Confident').length;
  const practicingCount = state.prepQuestions.filter((q) => q.status === 'Practicing').length;
  const needsReviewCount = state.prepQuestions.filter((q) => q.status === 'Needs Review').length;
  const notStartedCount = state.prepQuestions.filter((q) => q.status === 'Not Started').length;

  const percentMastered = Math.round((confidentCount / Math.max(totalQuestions, 1)) * 100);

  // Filtered Questions
  const filteredQuestions = state.prepQuestions.filter((q) => {
    if (selectedCategory !== 'All' && q.category !== selectedCategory) return false;
    if (selectedStatus !== 'All' && q.status !== selectedStatus) return false;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const match =
        q.question.toLowerCase().includes(query) ||
        q.idealAnswer.toLowerCase().includes(query) ||
        q.userNotes.toLowerCase().includes(query) ||
        q.keyConcepts.some((k) => k.toLowerCase().includes(query));
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Investment Banking Interview Preparation & Question Bank
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Master 400-question technical concepts, mock interviews, and past round takeaways
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Sub Tab Switcher */}
          <div className="flex items-center p-0.5 bg-slate-100 rounded border border-slate-200 text-xs">
            <button
              onClick={() => setActiveTab('questionBank')}
              className={`px-3 py-1.5 rounded font-medium transition-colors ${
                activeTab === 'questionBank'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Question Bank ({totalQuestions})
            </button>
            <button
              onClick={() => setActiveTab('interviews')}
              className={`px-3 py-1.5 rounded font-medium transition-colors ${
                activeTab === 'interviews'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Interview Rounds ({state.interviews.length})
            </button>
          </div>

          <button
            onClick={onOpenScheduleInterview}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors whitespace-nowrap"
          >
            <Plus size={14} />
            <span>Schedule Interview</span>
          </button>
        </div>
      </div>

      {/* 1. QUESTION BANK VIEW */}
      {activeTab === 'questionBank' && (
        <div className="space-y-4">
          {/* Progress Mastery Bar */}
          <div className="bg-white p-4 rounded border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900">Interview Technical Mastery</span>
                <span className="font-mono text-emerald-700 font-bold">{percentMastered}% Confident</span>
              </div>
              <div className="flex items-center gap-4 text-[11px] font-mono">
                <span className="text-emerald-700 font-medium">Confident: {confidentCount}</span>
                <span className="text-blue-700 font-medium">Practicing: {practicingCount}</span>
                <span className="text-amber-700 font-medium">Needs Review: {needsReviewCount}</span>
                <span className="text-slate-400">Not Started: {notStartedCount}</span>
              </div>
            </div>

            <div className="w-full bg-slate-100 h-2.5 rounded overflow-hidden flex">
              <div style={{ width: `${(confidentCount / totalQuestions) * 100}%` }} className="bg-emerald-500 h-full" title="Confident" />
              <div style={{ width: `${(practicingCount / totalQuestions) * 100}%` }} className="bg-blue-500 h-full" title="Practicing" />
              <div style={{ width: `${(needsReviewCount / totalQuestions) * 100}%` }} className="bg-amber-400 h-full" title="Needs Review" />
              <div style={{ width: `${(notStartedCount / totalQuestions) * 100}%` }} className="bg-slate-200 h-full" title="Not Started" />
            </div>
          </div>

          {/* Category Tabs & Search Filter */}
          <div className="bg-white p-3.5 rounded border border-slate-200 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search questions by concept (depreciation, WACC, LBO, merger, accretion)..."
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

              <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 text-xs">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-slate-700 focus:outline-none"
                >
                  <option value="All">All Statuses</option>
                  <option value="Confident">Confident</option>
                  <option value="Practicing">Practicing</option>
                  <option value="Needs Review">Needs Review</option>
                  <option value="Not Started">Not Started</option>
                </select>
              </div>
            </div>

            {/* Category pills/buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <button
                onClick={() => setSelectedCategory('All')}
                className={`px-3 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === 'All'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Topics ({totalQuestions})
              </button>
              {CATEGORIES.map((cat) => {
                const count = state.prepQuestions.filter((q) => q.category === cat).length;
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

          {/* Questions Accordion List */}
          <div className="space-y-3">
            {filteredQuestions.map((q) => {
              const isExpanded = expandedQuestionId === q.id;

              return (
                <div
                  key={q.id}
                  className="bg-white rounded border border-slate-200 shadow-2xs overflow-hidden transition-all"
                >
                  {/* Question Summary Row */}
                  <div
                    onClick={() => setExpandedQuestionId(isExpanded ? null : q.id)}
                    className="p-4 flex items-start justify-between gap-3 cursor-pointer hover:bg-slate-50/70"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 text-[11px]">
                        <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                          {q.category}
                        </span>
                        <span className="text-slate-400">·</span>
                        <span className="text-slate-500">{q.difficulty}</span>
                        {q.lastPracticed && (
                          <>
                            <span className="text-slate-400">·</span>
                            <span className="text-slate-400 font-mono">
                              Practiced: {formatDate(q.lastPracticed)}
                            </span>
                          </>
                        )}
                      </div>

                      <h3 className="text-sm font-semibold text-slate-900 leading-snug pt-0.5">
                        {q.question}
                      </h3>
                    </div>

                    <div className="flex items-center gap-3 shrink-0" onClick={(e) => e.stopPropagation()}>
                      {/* Status Selector */}
                      <select
                        value={q.status}
                        onChange={(e) =>
                          updatePrepQuestion(q.id, { status: e.target.value as QuestionStatus })
                        }
                        className={`text-xs font-semibold px-2 py-1 rounded border ${
                          q.status === 'Confident'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : q.status === 'Practicing'
                            ? 'bg-blue-50 text-blue-700 border-blue-300'
                            : q.status === 'Needs Review'
                            ? 'bg-amber-50 text-amber-700 border-amber-300'
                            : 'bg-slate-50 text-slate-600 border-slate-300'
                        }`}
                      >
                        <option value="Confident">Confident</option>
                        <option value="Practicing">Practicing</option>
                        <option value="Needs Review">Needs Review</option>
                        <option value="Not Started">Not Started</option>
                      </select>

                      <button
                        onClick={() => setExpandedQuestionId(isExpanded ? null : q.id)}
                        className="p-1 text-slate-400 hover:text-slate-600"
                      >
                        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Ideal Answer & Key Concepts & Notes */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-2 border-t border-slate-100 bg-slate-50/40 text-xs space-y-3">
                      <div>
                        <div className="font-semibold text-slate-800 uppercase text-[10px] tracking-wider mb-1">
                          Ideal Wall Street Model Answer
                        </div>
                        <div className="p-3 bg-white rounded border border-slate-200 text-slate-800 whitespace-pre-line leading-relaxed font-sans">
                          {q.idealAnswer}
                        </div>
                      </div>

                      {q.keyConcepts.length > 0 && (
                        <div>
                          <span className="font-semibold text-slate-700 text-[11px] block mb-1">
                            Key Concepts & Keywords to Mention:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {q.keyConcepts.map((k) => (
                              <span
                                key={k}
                                className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded text-[11px] font-medium"
                              >
                                {k}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Personal Notes Editor */}
                      <div>
                        <label className="font-semibold text-slate-700 text-[11px] block mb-1">
                          Your Personal Memory Hooks & Stumble Points:
                        </label>
                        <textarea
                          rows={2}
                          value={q.userNotes}
                          onChange={(e) => updatePrepQuestion(q.id, { userNotes: e.target.value })}
                          placeholder="Write mental tricks or formulas here..."
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. INTERVIEW ROUNDS VIEW */}
      {activeTab === 'interviews' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {state.interviews.map((interview) => (
              <div
                key={interview.id}
                onClick={() => setSelectedInterview(interview)}
                className="bg-white rounded border border-slate-200 p-5 shadow-sm hover:border-blue-400 cursor-pointer transition-all space-y-3 text-xs"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{interview.bank}</span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        interview.status === 'Offer Extended'
                          ? 'bg-emerald-100 text-emerald-800'
                          : interview.status === 'Passed'
                          ? 'bg-blue-100 text-blue-800'
                          : interview.status === 'Scheduled'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {interview.status}
                    </span>
                  </div>
                  <span className="font-mono text-slate-600 font-semibold">
                    {formatDate(interview.interviewDate)}
                  </span>
                </div>

                <div>
                  <div className="font-medium text-slate-800">{interview.position}</div>
                  <div className="text-slate-500 text-[11px] mt-0.5">
                    {interview.interviewRound} · {interview.interviewFormat}
                  </div>
                </div>

                <div className="bg-slate-50 p-2.5 rounded border border-slate-200 text-[11px]">
                  <strong className="text-slate-700">Interviewers:</strong> {interview.interviewerNames} (
                  {interview.interviewerRoles})
                </div>

                {interview.technicalQuestions && (
                  <div>
                    <strong className="text-slate-700 block text-[11px] mb-0.5">Technicals Asked:</strong>
                    <p className="text-slate-600 line-clamp-2">{interview.technicalQuestions}</p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-slate-500 text-[11px]">
                  <span>Click to view full notes & feedback</span>
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setEditingInterview(interview)}
                      className="p-1 text-slate-400 hover:text-blue-600"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Delete this interview record?')) {
                          deleteInterview(interview.id);
                        }
                      }}
                      className="p-1 text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interview Details Drawer / Modal */}
      {selectedInterview && (
        <div className="bg-white rounded border border-slate-200 p-6 shadow-sm space-y-5 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">{selectedInterview.bank} Interview</h2>
                <span className="px-2 py-0.5 bg-purple-50 text-purple-700 font-medium rounded">
                  {selectedInterview.interviewRound}
                </span>
                <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded">
                  {selectedInterview.interviewFormat}
                </span>
              </div>
              <div className="text-slate-500 mt-0.5">
                Date: <span className="font-mono">{formatDate(selectedInterview.interviewDate)}</span> · Position: {selectedInterview.position}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setEditingInterview(selectedInterview)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-medium"
              >
                Edit Notes
              </button>
              <button
                onClick={() => setSelectedInterview(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-slate-50 rounded border border-slate-200">
              <span className="font-semibold text-slate-900 block mb-1">Technical Questions Asked</span>
              <p className="whitespace-pre-line text-slate-700">{selectedInterview.technicalQuestions}</p>
            </div>

            <div className="p-3 bg-slate-50 rounded border border-slate-200">
              <span className="font-semibold text-slate-900 block mb-1">Behavioral / Fit Questions</span>
              <p className="whitespace-pre-line text-slate-700">{selectedInterview.behavioralQuestions}</p>
            </div>

            <div className="p-3 bg-emerald-50/50 rounded border border-emerald-200">
              <span className="font-semibold text-emerald-950 block mb-1">Questions Answered Well</span>
              <p className="whitespace-pre-line text-emerald-900">{selectedInterview.questionsAnsweredWell}</p>
            </div>

            <div className="p-3 bg-amber-50/50 rounded border border-amber-200">
              <span className="font-semibold text-amber-950 block mb-1">Questions Struggled With (Review Needed)</span>
              <p className="whitespace-pre-line text-amber-900">{selectedInterview.questionsStruggledWith}</p>
            </div>
          </div>

          {selectedInterview.feedback && (
            <div className="p-3 bg-blue-50/50 rounded border border-blue-200">
              <span className="font-semibold text-blue-950 block mb-1">Interviewer Feedback & Atmosphere</span>
              <p className="text-blue-900">{selectedInterview.feedback}</p>
            </div>
          )}
        </div>
      )}

      {/* Edit Interview Modal */}
      {editingInterview && (
        <InterviewModal
          interview={editingInterview}
          onClose={() => setEditingInterview(null)}
          onSave={async (saved) => {
            await saveInterview(saved);
            setEditingInterview(null);
          }}
        />
      )}
    </div>
  );
};

// Sub-component: Interview Create/Edit Modal
export const InterviewModal: React.FC<{
  interview: Partial<InterviewRecord>;
  onClose: () => void;
  onSave: (inv: Partial<InterviewRecord>) => Promise<void>;
}> = ({ interview, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<InterviewRecord>>({
    bank: interview.bank || 'Evercore',
    position: interview.position || '2027 Summer Analyst',
    interviewDate: interview.interviewDate || new Date().toISOString().split('T')[0],
    interviewRound: interview.interviewRound || 'First Round',
    interviewFormat: interview.interviewFormat || 'Virtual Superday (Zoom/Teams)',
    interviewerNames: interview.interviewerNames || '',
    interviewerRoles: interview.interviewerRoles || '',
    technicalQuestions: interview.technicalQuestions || '',
    behavioralQuestions: interview.behavioralQuestions || '',
    questionsStruggledWith: interview.questionsStruggledWith || '',
    questionsAnsweredWell: interview.questionsAnsweredWell || '',
    feedback: interview.feedback || '',
    preparationNotes: interview.preparationNotes || '',
    nextSteps: interview.nextSteps || '',
    status: interview.status || 'Scheduled',
    id: interview.id,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl border border-slate-200 max-w-2xl w-full my-8 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0">
          <h3 className="font-bold text-slate-900 text-sm">
            {formData.id ? `Edit Interview: ${formData.bank}` : 'Schedule / Log Interview'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Bank *</label>
              <input
                type="text"
                required
                value={formData.bank}
                onChange={(e) => setFormData({ ...formData, bank: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Interview Date *</label>
              <input
                type="date"
                required
                value={formData.interviewDate}
                onChange={(e) => setFormData({ ...formData, interviewDate: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Interview Round</label>
              <select
                value={formData.interviewRound}
                onChange={(e) => setFormData({ ...formData, interviewRound: e.target.value as InterviewRound })}
                className="w-full px-3 py-1.5 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-600"
              >
                <option value="First Round">First Round</option>
                <option value="Second Round">Second Round</option>
                <option value="Superday">Superday</option>
                <option value="Screen / Coffee Chat">Coffee Chat Screen</option>
                <option value="Final Round">Final Round</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Format</label>
              <select
                value={formData.interviewFormat}
                onChange={(e) => setFormData({ ...formData, interviewFormat: e.target.value as InterviewFormat })}
                className="w-full px-3 py-1.5 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-600"
              >
                <option value="Virtual Superday (Zoom/Teams)">Virtual (Zoom/Teams)</option>
                <option value="In-Person Superday">In-Person Superday</option>
                <option value="Phone">Phone</option>
                <option value="HireVue / Video">HireVue / Video</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Outcome Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-1.5 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-600"
              >
                <option value="Scheduled">Scheduled</option>
                <option value="Completed">Completed</option>
                <option value="Passed">Passed (Advancing)</option>
                <option value="Offer Extended">Offer Extended</option>
                <option value="Did Not Advance">Did Not Advance</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Interviewer Names</label>
              <input
                type="text"
                value={formData.interviewerNames}
                onChange={(e) => setFormData({ ...formData, interviewerNames: e.target.value })}
                placeholder="e.g. Elena Vance & Tyler Reed"
                className="w-full px-3 py-1.5 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Interviewer Roles</label>
              <input
                type="text"
                value={formData.interviewerRoles}
                onChange={(e) => setFormData({ ...formData, interviewerRoles: e.target.value })}
                placeholder="e.g. Associate M&A, VP Healthcare"
                className="w-full px-3 py-1.5 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Technical Questions Asked</label>
            <textarea
              rows={2}
              value={formData.technicalQuestions}
              onChange={(e) => setFormData({ ...formData, technicalQuestions: e.target.value })}
              className="w-full px-3 py-1.5 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Behavioral Questions Asked</label>
            <textarea
              rows={2}
              value={formData.behavioralQuestions}
              onChange={(e) => setFormData({ ...formData, behavioralQuestions: e.target.value })}
              className="w-full px-3 py-1.5 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Questions Answered Well</label>
              <textarea
                rows={2}
                value={formData.questionsAnsweredWell}
                onChange={(e) => setFormData({ ...formData, questionsAnsweredWell: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Questions Struggled With</label>
              <textarea
                rows={2}
                value={formData.questionsStruggledWith}
                onChange={(e) => setFormData({ ...formData, questionsStruggledWith: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Feedback & Notes</label>
            <textarea
              rows={2}
              value={formData.feedback}
              onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
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
              Save Interview
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
