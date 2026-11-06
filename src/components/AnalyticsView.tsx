import React from 'react';
import {
  BarChart3,
  Users,
  MessageSquare,
  Coffee,
  Phone,
  Mail,
  Linkedin,
  Calendar,
  AlertCircle,
  Clock,
  TrendingUp,
  Building,
  GraduationCap,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatDate, isPastDate, isWithinDays } from '../utils/helpers';

export const AnalyticsView: React.FC = () => {
  const { state, navigateWithFilter } = useApp();

  const totalUniqueContacts = state.contacts.length;
  const totalConversations = state.interactions.length;

  // Breakdown by interaction type
  const coffeeChats = state.interactions.filter(
    (i) => i.interactionType === 'In-Person Coffee Chat'
  ).length;
  const phoneCalls = state.interactions.filter((i) => i.interactionType === 'Phone Call').length;
  const zoomCalls = state.interactions.filter((i) => i.interactionType === 'Zoom').length;
  const emails = state.interactions.filter((i) => i.interactionType === 'Email').length;
  const linkedinConvs = state.interactions.filter((i) => i.interactionType === 'LinkedIn').length;
  const infoSessions = state.interactions.filter(
    (i) => i.interactionType === 'Information Session'
  ).length;

  // Average conversations per week (recruiting cycle active ~6 weeks)
  const avgConversationsPerWeek = (totalConversations / 6).toFixed(1);

  // Conversations by bank
  const bankConversationMap: Record<string, number> = {};
  state.interactions.forEach((i) => {
    const contact = state.contacts.find((c) => c.id === i.contactId);
    const bank = contact ? contact.bank : 'Other Bank';
    bankConversationMap[bank] = (bankConversationMap[bank] || 0) + 1;
  });

  const conversationsByBank = Object.entries(bankConversationMap).sort(
    (a, b) => b[1] - a[1]
  );
  const maxBankCount = Math.max(...conversationsByBank.map((b) => b[1]), 1);

  // Conversations by Seniority
  const seniorityMap: Record<string, number> = {
    Analyst: 0,
    Associate: 0,
    VP: 0,
    Director: 0,
    MD: 0,
    Recruiter: 0,
  };
  state.interactions.forEach((i) => {
    const contact = state.contacts.find((c) => c.id === i.contactId);
    if (contact && seniorityMap[contact.seniority] !== undefined) {
      seniorityMap[contact.seniority] += 1;
    }
  });

  // Contacts not contacted recently (> 21 days or never contacted)
  const twentyOneDaysAgo = new Date();
  twentyOneDaysAgo.setDate(twentyOneDaysAgo.getDate() - 21);
  const twentyOneDaysAgoStr = twentyOneDaysAgo.toISOString().split('T')[0];

  const neglectedContacts = state.contacts.filter((c) => {
    if (!c.lastContactedDate) return true;
    return c.lastContactedDate < twentyOneDaysAgoStr;
  });

  // Follow-ups overdue
  const todayStr = new Date().toISOString().split('T')[0];
  const overdueFollowUps = state.contacts.filter((c) => {
    if (!c.nextFollowUpDate) return false;
    return c.nextFollowUpDate < todayStr;
  });

  // Upcoming follow-ups (next 7 days)
  const upcomingFollowUps = state.contacts.filter((c) => {
    if (!c.nextFollowUpDate) return false;
    return c.nextFollowUpDate >= todayStr && isWithinDays(c.nextFollowUpDate, 7);
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          Networking Analytics & Conversion Insights
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Quantifying relationships, seniority distribution, touchpoint velocity, and pipeline momentum
        </p>
      </div>

      {/* KPI Headline Cards: Unique People vs Total Touchpoints */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Unique People</span>
            <Users size={15} className="text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {totalUniqueContacts}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Distinct bankers</div>
        </div>

        <div className="bg-white p-4 rounded border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Total Conversations</span>
            <MessageSquare size={15} className="text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {totalConversations}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Completed touchpoints</div>
        </div>

        <div className="bg-white p-4 rounded border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Avg Calls / Week</span>
            <TrendingUp size={15} className="text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {avgConversationsPerWeek}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Target: {state.goals.weeklyConversationsTarget}/wk</div>
        </div>

        <div className="bg-white p-4 rounded border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Coffee Chats</span>
            <Coffee size={15} className="text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {coffeeChats}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">In-person NYC / campus</div>
        </div>

        <div className="bg-white p-4 rounded border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Phone & Zoom</span>
            <Phone size={15} className="text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {phoneCalls + zoomCalls}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">{phoneCalls} Phone · {zoomCalls} Zoom</div>
        </div>

        <div className="bg-white p-4 rounded border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Emails & LinkedIn</span>
            <Mail size={15} className="text-sky-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {emails + linkedinConvs}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">{emails} Email · {linkedinConvs} InMail</div>
        </div>
      </div>

      {/* Main Charts Grid: Bank distribution + Seniority Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Conversations by Bank (7 Cols) */}
        <div className="lg:col-span-7 bg-white p-5 rounded border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Conversations by Bank</h3>
              <p className="text-xs text-slate-500 mt-0.5">Where your relationship hours are concentrated</p>
            </div>
            <span className="text-xs font-mono text-slate-400">Total: {totalConversations} calls</span>
          </div>

          <div className="space-y-3 pt-2">
            {conversationsByBank.map(([bank, count]) => {
              const uniqueBankContacts = state.contacts.filter((c) => c.bank === bank).length;
              return (
                <div key={bank} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">{bank}</span>
                    <span className="font-mono text-slate-500 text-[11px]">
                      {count} call{count === 1 ? '' : 's'} · {uniqueBankContacts} person{uniqueBankContacts === 1 ? '' : 's'}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded transition-all duration-300"
                      style={{ width: `${(count / maxBankCount) * 100}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Conversations by Seniority (5 Cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Conversations by Seniority</h3>
              <p className="text-xs text-slate-500 mt-0.5">Balancing junior champions and senior decision-makers</p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {Object.entries(seniorityMap).map(([title, count]) => {
              const maxSeniority = Math.max(...Object.values(seniorityMap), 1);
              return (
                <div key={title} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700">{title}</span>
                    <span className="font-mono text-slate-600 text-[11px]">
                      {count} ({Math.round((count / Math.max(totalConversations, 1)) * 100)}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full rounded"
                      style={{ width: `${(count / maxSeniority) * 100}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 leading-relaxed">
            <strong>Recruiting Strategy Tip:</strong> Analysts & Associates provide the highest volume of resume drops. VPs and MDs have direct interview invitation pull for their target groups.
          </div>
        </div>
      </div>

      {/* Relationship Maintenance Lists: Overdue follow-ups & Neglected Contacts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Overdue Follow-Ups */}
        <div className="bg-white p-5 rounded border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="text-rose-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Follow-Ups Overdue ({overdueFollowUps.length})
              </h3>
            </div>
            <span className="text-[11px] text-rose-700 font-medium">Needs Attention</span>
          </div>

          {overdueFollowUps.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400">
              No overdue follow-ups! You are fully caught up with all banker commitments.
            </div>
          ) : (
            <div className="space-y-2">
              {overdueFollowUps.map((c) => (
                <div
                  key={c.id}
                  onClick={() => navigateWithFilter('crm', { crmSearch: c.fullName })}
                  className="flex items-center justify-between p-2.5 rounded bg-rose-50/40 border border-rose-200 hover:bg-rose-100/50 cursor-pointer text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-900">{c.fullName}</div>
                    <div className="text-[11px] text-slate-600">
                      {c.bank} · {c.group} ({c.seniority})
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-rose-700 font-bold text-[11px]">
                      Due: {formatDate(c.nextFollowUpDate)}
                    </span>
                    <div className="text-[10px] text-rose-600 font-sans">Overdue</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Contacts Needing Follow-Up (Upcoming 7 Days) */}
        <div className="bg-white p-5 rounded border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-amber-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Upcoming Follow-Ups ({upcomingFollowUps.length})
              </h3>
            </div>
            <span className="text-[11px] text-amber-700 font-medium">Next 7 Days</span>
          </div>

          {upcomingFollowUps.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400">
              No upcoming follow-ups scheduled in the next 7 days.
            </div>
          ) : (
            <div className="space-y-2">
              {upcomingFollowUps.map((c) => (
                <div
                  key={c.id}
                  onClick={() => navigateWithFilter('crm', { crmSearch: c.fullName })}
                  className="flex items-center justify-between p-2.5 rounded bg-amber-50/40 border border-amber-200 hover:bg-amber-100/50 cursor-pointer text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-900">{c.fullName}</div>
                    <div className="text-[11px] text-slate-600">
                      {c.bank} · {c.group} ({c.seniority})
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-amber-800 font-semibold text-[11px]">
                      {formatDate(c.nextFollowUpDate)}
                    </span>
                    <div className="text-[10px] text-slate-500 font-sans">
                      Last: {formatDate(c.lastContactedDate)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
