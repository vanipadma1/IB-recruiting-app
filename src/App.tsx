import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { DashboardView } from './components/DashboardView';
import { CrmView, ContactModal } from './components/CrmView';
import { InteractionModal } from './components/InteractionModal';
import { ApplicationsView, ApplicationModal } from './components/ApplicationsView';
import { InterviewPrepView, InterviewModal } from './components/InterviewPrepView';
import { DocumentsView, DocumentModal } from './components/DocumentsView';
import { BankResearchView } from './components/BankResearchView';
import { TasksView, TaskModal } from './components/TasksView';
import { AnalyticsView } from './components/AnalyticsView';
import { GoalsView } from './components/GoalsView';
import { SettingsView } from './components/SettingsView';
import { CsvImportModal } from './components/CsvImportModal';

function AppContent() {
  const { activeTab, saveContact, saveApplication, saveInterview, saveTask, saveDocument } = useApp();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Quick Add / Global Modals state
  const [activeModal, setActiveModal] = useState<
    'contact' | 'application' | 'interaction' | 'task' | 'document' | 'interview' | 'import' | null
  >(null);
  const [targetContactIdForInteraction, setTargetContactIdForInteraction] = useState<string | undefined>(undefined);

  const handleOpenQuickAdd = (
    type: 'contact' | 'application' | 'interaction' | 'task' | 'document' | 'interview',
    contactId?: string
  ) => {
    if (type === 'interaction' && contactId) {
      setTargetContactIdForInteraction(contactId);
    } else {
      setTargetContactIdForInteraction(undefined);
    }
    setActiveModal(type);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 font-sans antialiased text-slate-900 select-text">
      {/* Sidebar Navigation */}
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Top Header */}
        <TopBar
          onOpenQuickAdd={(type) => handleOpenQuickAdd(type)}
          onOpenImportModal={() => setActiveModal('import')}
        />

        {/* Viewport View Switcher */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {activeTab === 'dashboard' && (
            <DashboardView onOpenQuickAdd={(type) => handleOpenQuickAdd(type)} />
          )}

          {activeTab === 'crm' && (
            <CrmView
              onOpenQuickAddContact={() => handleOpenQuickAdd('contact')}
              onOpenQuickAddInteraction={(contactId) => handleOpenQuickAdd('interaction', contactId)}
            />
          )}

          {activeTab === 'applications' && (
            <ApplicationsView onOpenQuickAddApplication={() => handleOpenQuickAdd('application')} />
          )}

          {activeTab === 'interviews' && (
            <InterviewPrepView onOpenScheduleInterview={() => handleOpenQuickAdd('interview')} />
          )}

          {activeTab === 'documents' && (
            <DocumentsView onOpenQuickAddDocument={() => handleOpenQuickAdd('document')} />
          )}

          {activeTab === 'banks' && <BankResearchView />}

          {activeTab === 'tasks' && (
            <TasksView onOpenQuickAddTask={() => handleOpenQuickAdd('task')} />
          )}

          {activeTab === 'analytics' && <AnalyticsView />}

          {activeTab === 'goals' && <GoalsView />}

          {activeTab === 'settings' && (
            <SettingsView onOpenImportModal={() => setActiveModal('import')} />
          )}
        </main>
      </div>

      {/* Global Quick Add Modals */}
      {activeModal === 'contact' && (
        <ContactModal
          contact={{}}
          onClose={() => setActiveModal(null)}
          onSave={async (saved) => {
            await saveContact(saved);
            setActiveModal(null);
          }}
        />
      )}

      {activeModal === 'interaction' && (
        <InteractionModal
          contactId={targetContactIdForInteraction}
          onClose={() => {
            setActiveModal(null);
            setTargetContactIdForInteraction(undefined);
          }}
        />
      )}

      {activeModal === 'application' && (
        <ApplicationModal
          application={{}}
          onClose={() => setActiveModal(null)}
          onSave={async (saved) => {
            await saveApplication(saved);
            setActiveModal(null);
          }}
        />
      )}

      {activeModal === 'interview' && (
        <InterviewModal
          interview={{}}
          onClose={() => setActiveModal(null)}
          onSave={async (saved) => {
            await saveInterview(saved);
            setActiveModal(null);
          }}
        />
      )}

      {activeModal === 'task' && (
        <TaskModal
          task={{}}
          onClose={() => setActiveModal(null)}
          onSave={async (saved) => {
            await saveTask(saved);
            setActiveModal(null);
          }}
        />
      )}

      {activeModal === 'document' && (
        <DocumentModal
          document={{}}
          onClose={() => setActiveModal(null)}
          onSave={async (saved) => {
            await saveDocument(saved);
            setActiveModal(null);
          }}
        />
      )}

      {activeModal === 'import' && (
        <CsvImportModal onClose={() => setActiveModal(null)} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
