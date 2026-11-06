import React from 'react';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  BookOpen,
  FileText,
  Building2,
  CheckSquare,
  BarChart3,
  Target,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { NavigationTab, useApp } from '../context/AppContext';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const { activeTab, setActiveTab, state } = useApp();

  const pendingTasksCount = state.tasks.filter((t) => t.status !== 'Completed').length;
  const interviewsCount = state.interviews.filter((i) => i.status === 'Scheduled').length;
  const offersCount = state.applications.filter((a) => a.status === 'Offer').length;

  const navItems: { id: NavigationTab; label: string; icon: React.ElementType; badge?: string | number; badgeColor?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'crm', label: 'Networking CRM', icon: Users, badge: state.contacts.length },
    { id: 'applications', label: 'Internship Applications', icon: Briefcase, badge: offersCount > 0 ? `${offersCount} Offer` : state.applications.length, badgeColor: offersCount > 0 ? 'text-emerald-700 bg-emerald-50' : undefined },
    { id: 'interviews', label: 'Interview Prep', icon: BookOpen, badge: interviewsCount > 0 ? `${interviewsCount} Live` : undefined, badgeColor: 'text-amber-700 bg-amber-50' },
    { id: 'documents', label: 'Documents & Notes', icon: FileText, badge: state.documents.length },
    { id: 'banks', label: 'Bank Research', icon: Building2, badge: state.banks.filter((b) => b.isTarget).length },
    { id: 'tasks', label: 'Tasks & Follow-Ups', icon: CheckSquare, badge: pendingTasksCount > 0 ? pendingTasksCount : undefined, badgeColor: 'text-rose-700 bg-rose-50' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'goals', label: 'Recruiting Goals', icon: Target },
    { id: 'settings', label: 'Settings & Data', icon: Settings },
  ];

  return (
    <aside
      className={`relative flex flex-col bg-slate-900 text-slate-200 border-r border-slate-800 transition-all duration-200 select-none z-20 shrink-0 ${
        collapsed ? 'w-18' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800/80">
        <div
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center gap-3 cursor-pointer overflow-hidden"
          title="IB Recruiting Hub"
        >
          <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-white text-sm shrink-0 shadow-sm">
            IB
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="font-bold text-sm tracking-tight text-white whitespace-nowrap">
                IB Recruiting Hub
              </div>
              <div className="text-[11px] text-slate-400 font-normal truncate">
                Summer Analyst OS
              </div>
            </div>
          )}
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Target Class Indicator */}
      {!collapsed && (
        <div className="mx-3 my-2 px-3 py-2 bg-slate-800/60 rounded border border-slate-700/50 text-[11px]">
          <div className="flex items-center justify-between text-slate-300 font-medium">
            <span>Target Cycle</span>
            <span className="font-mono text-emerald-400">Summer 2027</span>
          </div>
          <div className="text-slate-400 truncate mt-0.5">
            {state.userProfile.university}
          </div>
        </div>
      )}

      {/* Navigation List */}
      <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded transition-colors whitespace-nowrap text-left ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={17} className="shrink-0" />
              {!collapsed && (
                <>
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                        isActive
                          ? 'bg-blue-700 text-white'
                          : item.badgeColor || 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Profile Mini Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
        <div
          onClick={() => setActiveTab('settings')}
          className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition-opacity"
          title="Account profile & settings"
        >
          <div className="w-7 h-7 rounded-full bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center shrink-0">
            {state.userProfile.name
              .split(' ')
              .map((n) => n[0])
              .join('')}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium text-white truncate">
                {state.userProfile.name}
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                GPA {state.userProfile.gpa} · Wharton '27
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
