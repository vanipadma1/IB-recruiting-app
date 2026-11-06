import React, { useState } from 'react';
import {
  Target,
  TrendingUp,
  CheckCircle2,
  Clock,
  Edit2,
  Users,
  MessageSquare,
  Send,
  BookOpen,
  Award,
  Zap,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { calculateDashboardMetrics } from '../utils/helpers';

export const GoalsView: React.FC = () => {
  const { state, saveGoals } = useApp();

  const [isEditing, setIsEditing] = useState(false);
  const [goalsForm, setGoalsForm] = useState(state.goals);

  const metrics = calculateDashboardMetrics(
    state.contacts,
    state.interactions,
    state.applications,
    state.tasks
  );

  // Weekly actuals
  const conversationsActual = metrics.conversationsThisWeek;
  
  // New contacts added in last 7 days
  const sevenDaysAgoStr = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const newContactsActual = state.contacts.filter((c) => c.dateAdded >= sevenDaysAgoStr).length;

  const applicationsActual = metrics.applicationsThisWeek;

  // Technical prep sessions in last 7 days
  const technicalsActual = state.prepQuestions.filter(
    (q) => q.lastPracticed && q.lastPracticed >= sevenDaysAgoStr
  ).length;

  // 24h follow up rate (% of interactions where thank you sent is true)
  const totalInteractions = state.interactions.length;
  const thankYousSent = state.interactions.filter((i) => i.thankYouEmailSent).length;
  const followUpComplianceRate = totalInteractions > 0 ? Math.round((thankYousSent / totalInteractions) * 100) : 100;

  const offersActual = state.applications.filter((a) => a.status === 'Offer').length;

  const handleSaveGoals = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveGoals(goalsForm);
    setIsEditing(false);
  };

  const goalsList = [
    {
      title: 'Weekly Networking Conversations',
      description: 'Phone calls, informational coffee chats, and Zoom interviews completed this week',
      icon: MessageSquare,
      actual: conversationsActual,
      target: state.goals.weeklyConversationsTarget,
      unit: 'calls / wk',
      color: 'blue',
    },
    {
      title: 'Weekly New Banker Contacts',
      description: 'New investment bankers identified and added into CRM tracker',
      icon: Users,
      actual: newContactsActual,
      target: state.goals.weeklyNewContactsTarget,
      unit: 'contacts / wk',
      color: 'indigo',
    },
    {
      title: 'Weekly Applications Submitted',
      description: 'Completed portal applications with tailored resume & cover letter',
      icon: Send,
      actual: applicationsActual,
      target: state.goals.weeklyApplicationsTarget,
      unit: 'apps / wk',
      color: 'emerald',
    },
    {
      title: 'Weekly Technical Question Drills',
      description: '400-question practice drills (Accounting, Valuation, LBO, DCF)',
      icon: BookOpen,
      actual: technicalsActual,
      target: state.goals.weeklyTechnicalSessionsTarget,
      unit: 'sessions / wk',
      color: 'purple',
    },
    {
      title: '24-Hour Follow-Up & Thank-You Compliance',
      description: 'Sending thank-you email within 24 hours of every networking call',
      icon: Zap,
      actual: followUpComplianceRate,
      target: 100,
      unit: '% compliance',
      color: 'amber',
    },
    {
      title: 'Target Offers Received',
      description: 'Summer Analyst offers secured at target Bulge Bracket or Elite Boutique banks',
      icon: Award,
      actual: offersActual,
      target: state.goals.targetOffers,
      unit: 'offers',
      color: 'emerald',
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Recruiting Goals & Weekly Pace Targets
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Hold yourself accountable to consistent networking volume, technical drills, and response discipline
          </p>
        </div>

        <button
          onClick={() => {
            setGoalsForm(state.goals);
            setIsEditing(!isEditing);
          }}
          className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors whitespace-nowrap self-start sm:self-auto"
        >
          <Edit2 size={13} />
          <span>{isEditing ? 'Close Target Editor' : 'Adjust Weekly Targets'}</span>
        </button>
      </div>

      {/* Target Customizer Form */}
      {isEditing && (
        <form
          onSubmit={handleSaveGoals}
          className="bg-white p-5 rounded border border-slate-200 shadow-sm space-y-4 text-xs"
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">Customize Recruiting Targets</h3>
            <span className="text-slate-500 text-[11px]">Values update your weekly analytics automatically</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Weekly Conversations Target
              </label>
              <input
                type="number"
                min={1}
                value={goalsForm.weeklyConversationsTarget}
                onChange={(e) =>
                  setGoalsForm({
                    ...goalsForm,
                    weeklyConversationsTarget: parseInt(e.target.value, 10) || 5,
                  })
                }
                className="w-full px-3 py-1.5 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Weekly New Contacts Target
              </label>
              <input
                type="number"
                min={1}
                value={goalsForm.weeklyNewContactsTarget}
                onChange={(e) =>
                  setGoalsForm({
                    ...goalsForm,
                    weeklyNewContactsTarget: parseInt(e.target.value, 10) || 3,
                  })
                }
                className="w-full px-3 py-1.5 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Weekly Applications Target
              </label>
              <input
                type="number"
                min={1}
                value={goalsForm.weeklyApplicationsTarget}
                onChange={(e) =>
                  setGoalsForm({
                    ...goalsForm,
                    weeklyApplicationsTarget: parseInt(e.target.value, 10) || 2,
                  })
                }
                className="w-full px-3 py-1.5 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Weekly Technical Practice Sessions
              </label>
              <input
                type="number"
                min={1}
                value={goalsForm.weeklyTechnicalSessionsTarget}
                onChange={(e) =>
                  setGoalsForm({
                    ...goalsForm,
                    weeklyTechnicalSessionsTarget: parseInt(e.target.value, 10) || 2,
                  })
                }
                className="w-full px-3 py-1.5 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Target Offers</label>
              <input
                type="number"
                min={1}
                value={goalsForm.targetOffers}
                onChange={(e) =>
                  setGoalsForm({
                    ...goalsForm,
                    targetOffers: parseInt(e.target.value, 10) || 1,
                  })
                }
                className="w-full px-3 py-1.5 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold"
            >
              Save Targets
            </button>
          </div>
        </form>
      )}

      {/* Goals Progress Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {goalsList.map((g, i) => {
          const Icon = g.icon;
          const percent = Math.min(100, Math.round((g.actual / Math.max(g.target, 1)) * 100));
          const isCompleted = g.actual >= g.target;

          return (
            <div
              key={i}
              className="bg-white rounded border border-slate-200 p-5 shadow-2xs space-y-4 text-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700">
                      <Icon size={16} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm leading-tight">{g.title}</h3>
                    </div>
                  </div>

                  {isCompleted && (
                    <span className="flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold uppercase">
                      <CheckCircle2 size={12} />
                      <span>Met</span>
                    </span>
                  )}
                </div>

                <p className="text-slate-500 text-xs mt-2 leading-relaxed">{g.description}</p>
              </div>

              {/* Progress and Numbers */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-baseline justify-between">
                  <div className="font-mono text-2xl font-bold text-slate-900 tabular-nums">
                    {g.actual}{' '}
                    <span className="text-xs font-normal text-slate-500">
                      / {g.target} {g.unit}
                    </span>
                  </div>
                  <span className="font-mono text-xs font-semibold text-slate-600">
                    {percent}%
                  </span>
                </div>

                <div className="w-full bg-slate-100 h-2.5 rounded overflow-hidden">
                  <div
                    className={`h-full rounded transition-all duration-300 ${
                      isCompleted ? 'bg-emerald-500' : 'bg-blue-600'
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
