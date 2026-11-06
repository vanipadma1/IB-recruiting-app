import React from 'react';
import {
  Users,
  MessageSquare,
  Coffee,
  Send,
  Clock,
  Calendar,
  Award,
  AlertCircle,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Building,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import { calculateDashboardMetrics, formatDate, isPastDate, isToday, isWithinDays } from '../utils/helpers';

export const DashboardView: React.FC<{
  onOpenQuickAdd: (type: 'contact' | 'application' | 'interaction' | 'task' | 'document' | 'interview') => void;
}> = ({ onOpenQuickAdd }) => {
  const { state, navigateWithFilter, toggleTaskStatus, setActiveTab } = useApp();

  const metrics = calculateDashboardMetrics(
    state.contacts,
    state.interactions,
    state.applications,
    state.tasks
  );

  // Pipeline breakdown
  const networkingStageCount = state.applications.filter((a) =>
    ['Interested', 'Researching', 'Networking', 'Preparing to Apply'].includes(a.status)
  ).length;

  const appliedStageCount = state.applications.filter((a) =>
    ['Applied', 'Referral Requested', 'Referral Received', 'Online Assessment'].includes(a.status)
  ).length;

  const firstRoundCount = state.applications.filter((a) => a.status === 'First Round').length;
  const superdayCount = state.applications.filter((a) => a.status === 'Superday').length;
  const offerCount = state.applications.filter((a) => a.status === 'Offer').length;

  const triggerOfferCelebration = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  // Today's priorities
  const todayStr = new Date().toISOString().split('T')[0];
  
  // 1. Follow-ups due today or overdue
  const followUpContacts = state.contacts.filter((c) => {
    if (!c.nextFollowUpDate) return false;
    return c.nextFollowUpDate <= todayStr || isWithinDays(c.nextFollowUpDate, 3);
  });

  // 2. Upcoming interviews
  const upcomingInterviews = state.interviews.filter((i) => i.status === 'Scheduled');

  // 3. Applications with approaching deadlines (within 14 days)
  const urgentApplications = state.applications.filter((a) => {
    if (['Offer', 'Rejected', 'Withdrawn'].includes(a.status)) return false;
    return isWithinDays(a.applicationDeadline, 14);
  });

  // 4. Overdue or high priority tasks
  const pendingTasks = state.tasks.filter((t) => t.status !== 'Completed');

  // Activity over last 6 weeks (trend data)
  const activityWeeks = [
    { label: 'W-5', conversations: 4, applications: 1 },
    { label: 'W-4', conversations: 6, applications: 2 },
    { label: 'W-3', conversations: 7, applications: 3 },
    { label: 'W-2', conversations: 9, applications: 2 },
    { label: 'W-1', conversations: 8, applications: 4 },
    { label: 'This Wk', conversations: metrics.conversationsThisWeek, applications: metrics.applicationsThisWeek },
  ];

  const maxVal = Math.max(
    ...activityWeeks.map((w) => Math.max(w.conversations, w.applications)),
    10
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner / Hero Summary */}
      <div className="bg-slate-900 text-white rounded-lg p-6 border border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono text-blue-400">
            {state.userProfile.university} · Class of {state.userProfile.graduationYear}
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white mt-1">
            Welcome back, {state.userProfile.name}
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            You are actively tracking <span className="font-semibold text-white">{metrics.totalContacts} bankers</span> across Bulge Bracket & Elite Boutique franchises. You have {metrics.interviewsScheduled} interviews scheduled and {metrics.offersReceived} offer extended.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {offerCount > 0 && (
            <button
              onClick={triggerOfferCelebration}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
              title="Celebrate Offer!"
            >
              <Sparkles size={14} />
              <span>{offerCount} Offer Secured</span>
            </button>
          )}
          <button
            onClick={() => onOpenQuickAdd('interaction')}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Coffee size={14} />
            <span>Log Coffee Chat</span>
          </button>
        </div>
      </div>

      {/* 10 Summary Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Recruiting Performance Overview
          </h2>
          <span className="text-[11px] text-slate-400">
            Click any metric to filter lists
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* Card 1 */}
          <div
            onClick={() => navigateWithFilter('crm', {})}
            className="bg-white p-4 rounded border border-slate-200 hover:border-blue-400 hover:shadow-sm cursor-pointer transition-all"
          >
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium">Total Contacts</span>
              <Users size={16} className="text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {metrics.totalContacts}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Unique bankers</div>
          </div>

          {/* Card 2 */}
          <div
            onClick={() => navigateWithFilter('analytics', {})}
            className="bg-white p-4 rounded border border-slate-200 hover:border-blue-400 hover:shadow-sm cursor-pointer transition-all"
          >
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium">Conversations</span>
              <MessageSquare size={16} className="text-indigo-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {metrics.totalConversations}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Total touchpoints</div>
          </div>

          {/* Card 3 */}
          <div
            onClick={() => navigateWithFilter('analytics', {})}
            className="bg-white p-4 rounded border border-slate-200 hover:border-blue-400 hover:shadow-sm cursor-pointer transition-all"
          >
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium">Info Interviews</span>
              <Coffee size={16} className="text-amber-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {metrics.totalInformationalInterviews}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Calls, Zooms, Coffees</div>
          </div>

          {/* Card 4 */}
          <div
            onClick={() => navigateWithFilter('applications', { appStage: 'Applied' })}
            className="bg-white p-4 rounded border border-slate-200 hover:border-blue-400 hover:shadow-sm cursor-pointer transition-all"
          >
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium">Apps Submitted</span>
              <Send size={16} className="text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {metrics.applicationsSubmitted}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Portals completed</div>
          </div>

          {/* Card 5 */}
          <div
            onClick={() => navigateWithFilter('applications', {})}
            className="bg-white p-4 rounded border border-slate-200 hover:border-blue-400 hover:shadow-sm cursor-pointer transition-all"
          >
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium">In Progress</span>
              <Clock size={16} className="text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {metrics.applicationsInProgress}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Active pipelines</div>
          </div>

          {/* Card 6 */}
          <div
            onClick={() => navigateWithFilter('interviews', {})}
            className="bg-white p-4 rounded border border-slate-200 hover:border-blue-400 hover:shadow-sm cursor-pointer transition-all"
          >
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium">Interviews</span>
              <Calendar size={16} className="text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-purple-700 font-mono tabular-nums">
              {metrics.interviewsScheduled}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">First rounds & superdays</div>
          </div>

          {/* Card 7 */}
          <div
            onClick={() => navigateWithFilter('applications', { appStage: 'Offer' })}
            className="bg-white p-4 rounded border border-slate-200 hover:border-emerald-400 hover:shadow-sm cursor-pointer transition-all bg-gradient-to-b from-white to-emerald-50/30"
          >
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium">Offers Received</span>
              <Award size={16} className="text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-emerald-600 font-mono tabular-nums">
              {metrics.offersReceived}
            </div>
            <div className="text-[11px] text-emerald-700 mt-1 font-medium">Jefferies SA '27</div>
          </div>

          {/* Card 8 */}
          <div
            onClick={() => navigateWithFilter('crm', { crmFollowUpDueOnly: true })}
            className={`bg-white p-4 rounded border cursor-pointer transition-all ${
              metrics.followUpsDue > 0
                ? 'border-amber-300 bg-amber-50/20 hover:border-amber-400'
                : 'border-slate-200 hover:border-blue-400'
            }`}
          >
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium">Follow-Ups Due</span>
              <AlertCircle size={16} className={metrics.followUpsDue > 0 ? 'text-amber-600' : 'text-slate-400'} />
            </div>
            <div className={`text-2xl font-bold font-mono tabular-nums ${metrics.followUpsDue > 0 ? 'text-amber-700' : 'text-slate-900'}`}>
              {metrics.followUpsDue}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Action required</div>
          </div>

          {/* Card 9 */}
          <div
            onClick={() => navigateWithFilter('analytics', {})}
            className="bg-white p-4 rounded border border-slate-200 hover:border-blue-400 hover:shadow-sm cursor-pointer transition-all"
          >
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium">Calls This Week</span>
              <TrendingUp size={16} className="text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {metrics.conversationsThisWeek}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Target: {state.goals.weeklyConversationsTarget}/wk</div>
          </div>

          {/* Card 10 */}
          <div
            onClick={() => navigateWithFilter('applications', {})}
            className="bg-white p-4 rounded border border-slate-200 hover:border-blue-400 hover:shadow-sm cursor-pointer transition-all"
          >
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium">Apps This Week</span>
              <Send size={16} className="text-indigo-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {metrics.applicationsThisWeek}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Target: {state.goals.weeklyApplicationsTarget}/wk</div>
          </div>
        </div>
      </div>

      {/* Recruiting Pipeline Funnel Visualization */}
      <div className="bg-white p-5 rounded border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Recruiting Funnel & Stage Conversions
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Click any stage in the pipeline to view and manage active applications
            </p>
          </div>
          <button
            onClick={() => setActiveTab('applications')}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Open Kanban Board</span>
            <ArrowRight size={13} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {/* Stage 1: Networking / Outreach */}
          <div
            onClick={() => navigateWithFilter('applications', { appStage: 'Networking' })}
            className="bg-slate-50 hover:bg-blue-50/50 p-3.5 rounded border border-slate-200 hover:border-blue-300 transition-all cursor-pointer relative"
          >
            <div className="flex items-center justify-between text-xs font-medium text-slate-600">
              <span>01. Networking</span>
              <span className="font-mono text-slate-400">Step 1</span>
            </div>
            <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-2">
              {networkingStageCount}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Banks in research phase</div>
            <div className="w-full bg-slate-200 h-1 rounded mt-3 overflow-hidden">
              <div className="bg-blue-500 h-full w-full"></div>
            </div>
          </div>

          {/* Stage 2: Application Submitted */}
          <div
            onClick={() => navigateWithFilter('applications', { appStage: 'Applied' })}
            className="bg-slate-50 hover:bg-blue-50/50 p-3.5 rounded border border-slate-200 hover:border-blue-300 transition-all cursor-pointer relative"
          >
            <div className="flex items-center justify-between text-xs font-medium text-slate-600">
              <span>02. Applied</span>
              <span className="font-mono text-slate-400">
                {Math.round((appliedStageCount / Math.max(state.applications.length, 1)) * 100)}%
              </span>
            </div>
            <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-2">
              {appliedStageCount}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Submitted / Assessments</div>
            <div className="w-full bg-slate-200 h-1 rounded mt-3 overflow-hidden">
              <div
                className="bg-indigo-500 h-full"
                style={{ width: `${Math.min(100, (appliedStageCount / 8) * 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Stage 3: First Round */}
          <div
            onClick={() => navigateWithFilter('applications', { appStage: 'First Round' })}
            className="bg-slate-50 hover:bg-blue-50/50 p-3.5 rounded border border-slate-200 hover:border-blue-300 transition-all cursor-pointer relative"
          >
            <div className="flex items-center justify-between text-xs font-medium text-slate-600">
              <span>03. First Round</span>
              <span className="font-mono text-purple-600 font-semibold">Active</span>
            </div>
            <div className="text-2xl font-bold text-purple-700 font-mono tabular-nums mt-2">
              {firstRoundCount}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Evercore & PJT RSSG</div>
            <div className="w-full bg-slate-200 h-1 rounded mt-3 overflow-hidden">
              <div className="bg-purple-500 h-full w-3/4"></div>
            </div>
          </div>

          {/* Stage 4: Superday */}
          <div
            onClick={() => navigateWithFilter('applications', { appStage: 'Superday' })}
            className="bg-slate-50 hover:bg-blue-50/50 p-3.5 rounded border border-slate-200 hover:border-blue-300 transition-all cursor-pointer relative"
          >
            <div className="flex items-center justify-between text-xs font-medium text-slate-600">
              <span>04. Superday</span>
              <span className="font-mono text-amber-600 font-semibold">Goldman</span>
            </div>
            <div className="text-2xl font-bold text-amber-700 font-mono tabular-nums mt-2">
              {superdayCount}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">GS Final Round Nov 18</div>
            <div className="w-full bg-slate-200 h-1 rounded mt-3 overflow-hidden">
              <div className="bg-amber-500 h-full w-1/2"></div>
            </div>
          </div>

          {/* Stage 5: Offer */}
          <div
            onClick={() => navigateWithFilter('applications', { appStage: 'Offer' })}
            className="bg-emerald-50/50 hover:bg-emerald-100/50 p-3.5 rounded border border-emerald-200 hover:border-emerald-400 transition-all cursor-pointer relative"
          >
            <div className="flex items-center justify-between text-xs font-medium text-emerald-800">
              <span>05. Offer</span>
              <Award size={14} className="text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-emerald-700 font-mono tabular-nums mt-2">
              {offerCount}
            </div>
            <div className="text-[11px] text-emerald-600 mt-1 font-medium">Jefferies M&A Offer</div>
            <div className="w-full bg-emerald-200 h-1 rounded mt-3 overflow-hidden">
              <div className="bg-emerald-600 h-full w-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Activity Chart (Left) + Today's Priorities (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recruiting Activity Chart (5 Cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Recruiting Activity Over Time</h3>
                <p className="text-xs text-slate-500 mt-0.5">Weekly touchpoints and submissions</p>
              </div>
              <div className="flex items-center gap-3 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-blue-600 rounded-sm"></span>
                  <span className="text-slate-600">Calls & Chats</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-sm"></span>
                  <span className="text-slate-600">Applications</span>
                </div>
              </div>
            </div>

            {/* Custom Bar Visualization */}
            <div className="mt-8 space-y-4">
              {activityWeeks.map((wk, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-600 font-medium">
                    <span>{wk.label}</span>
                    <span className="font-mono text-slate-500 text-[11px]">
                      {wk.conversations} calls · {wk.applications} apps
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-1">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-100 h-2 rounded overflow-hidden">
                        <div
                          className="bg-blue-600 h-full rounded transition-all duration-300"
                          style={{ width: `${(wk.conversations / maxVal) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-[10px] font-mono w-4 text-right text-slate-600">
                        {wk.conversations}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-100 h-2 rounded overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded transition-all duration-300"
                          style={{ width: `${(wk.applications / maxVal) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-[10px] font-mono w-4 text-right text-slate-600">
                        {wk.applications}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Pace: {(metrics.totalConversations / 6).toFixed(1)} calls / week avg</span>
            <button
              onClick={() => setActiveTab('analytics')}
              className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
            >
              <span>View full analytics</span>
              <ChevronRight size={13} />
            </button>
          </div>
        </div>

        {/* Today's Priorities Section (7 Cols) */}
        <div className="lg:col-span-7 bg-white p-5 rounded border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Today's Priorities & Action Items</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Interviews, urgent follow-ups, and recruiting tasks
                </p>
              </div>
              <button
                onClick={() => onOpenQuickAdd('task')}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                + Add Task
              </button>
            </div>

            <div className="space-y-3">
              {/* Upcoming Interview Alert Box */}
              {upcomingInterviews.length > 0 && (
                <div className="p-3 bg-purple-50 border border-purple-200 rounded">
                  <div className="flex items-center justify-between text-xs font-semibold text-purple-900">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-purple-600" />
                      <span>Upcoming Interview: {upcomingInterviews[0].bank}</span>
                    </div>
                    <span className="font-mono text-purple-700">
                      {formatDate(upcomingInterviews[0].interviewDate)}
                    </span>
                  </div>
                  <div className="text-xs text-purple-800 mt-1">
                    {upcomingInterviews[0].interviewRound} · {upcomingInterviews[0].position}
                  </div>
                  <div className="text-[11px] text-purple-600 mt-1">
                    Interviewers: {upcomingInterviews[0].interviewerNames}
                  </div>
                </div>
              )}

              {/* Follow-Ups Due */}
              {followUpContacts.slice(0, 3).map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded text-xs hover:bg-slate-100/70 transition-colors"
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900">{contact.fullName}</span>
                      <span className="text-slate-400">·</span>
                      <span className="text-slate-600">{contact.bank} ({contact.group})</span>
                    </div>
                    <div className="text-slate-500 text-[11px] truncate mt-0.5">
                      {contact.notes || 'Time to reconnect and send an update.'}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className="font-mono text-[11px] font-medium text-amber-700">
                        {isToday(contact.nextFollowUpDate)
                          ? 'Due Today'
                          : isPastDate(contact.nextFollowUpDate)
                          ? 'Overdue'
                          : formatDate(contact.nextFollowUpDate)}
                      </div>
                    </div>
                    <button
                      onClick={() => navigateWithFilter('crm', { crmSearch: contact.fullName })}
                      className="px-2 py-1 bg-white border border-slate-300 hover:border-slate-400 rounded text-[11px] font-medium text-slate-700 shadow-2xs"
                    >
                      View
                    </button>
                  </div>
                </div>
              ))}

              {/* Tasks List */}
              {pendingTasks.slice(0, 3).map((task) => (
                <div
                  key={task.id}
                  className="flex items-start justify-between p-3 border border-slate-200 rounded text-xs hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start gap-2.5 min-w-0 pr-2">
                    <input
                      type="checkbox"
                      checked={task.status === 'Completed'}
                      onChange={() => toggleTaskStatus(task.id)}
                      className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <div>
                      <div className="font-medium text-slate-900">{task.title}</div>
                      <div className="text-slate-500 text-[11px] mt-0.5">
                        {task.type} {task.bank && `· ${task.bank}`}
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                        task.priority === 'Urgent'
                          ? 'bg-rose-100 text-rose-800'
                          : task.priority === 'High'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {task.priority}
                    </span>
                    <div className="text-[10px] text-slate-400 mt-1 font-mono">
                      {formatDate(task.dueDate)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>{pendingTasks.length} pending recruiting action items</span>
            <button
              onClick={() => setActiveTab('tasks')}
              className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
            >
              <span>Manage all tasks</span>
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
