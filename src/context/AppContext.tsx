import React, { createContext, useContext, useEffect, useState } from 'react';
import { initialSeedData } from '../data/seedData';
import {
  Application,
  AppState,
  BankProfile,
  Contact,
  DocumentItem,
  Interaction,
  InterviewRecord,
  PrepQuestion,
  RecruitingGoals,
  TaskItem,
  UserProfile,
} from '../types';

export type NavigationTab =
  | 'dashboard'
  | 'crm'
  | 'applications'
  | 'interviews'
  | 'documents'
  | 'banks'
  | 'tasks'
  | 'analytics'
  | 'goals'
  | 'settings';

interface FilterState {
  crmBank?: string;
  crmStatus?: string;
  crmSeniority?: string;
  crmFollowUpDueOnly?: boolean;
  crmSearch?: string;
  appStage?: string;
  appSearch?: string;
}

interface AppContextType {
  state: AppState;
  loading: boolean;
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  navigateWithFilter: (tab: NavigationTab, filterOverrides: Partial<FilterState>) => void;
  // Contact methods
  saveContact: (contact: Partial<Contact>) => Promise<Contact>;
  deleteContact: (id: string) => Promise<void>;
  // Interaction methods
  saveInteraction: (interaction: Partial<Interaction>) => Promise<Interaction>;
  deleteInteraction: (id: string) => Promise<void>;
  // Application methods
  saveApplication: (app: Partial<Application>) => Promise<Application>;
  deleteApplication: (id: string) => Promise<void>;
  updateApplicationStatus: (id: string, status: Application['status']) => Promise<void>;
  // Document methods
  saveDocument: (doc: Partial<DocumentItem>) => Promise<DocumentItem>;
  deleteDocument: (id: string) => Promise<void>;
  // Interview methods
  saveInterview: (interview: Partial<InterviewRecord>) => Promise<InterviewRecord>;
  deleteInterview: (id: string) => Promise<void>;
  // Prep question methods
  updatePrepQuestion: (id: string, updates: Partial<PrepQuestion>) => Promise<void>;
  // Task methods
  saveTask: (task: Partial<TaskItem>) => Promise<TaskItem>;
  deleteTask: (id: string) => Promise<void>;
  toggleTaskStatus: (id: string) => Promise<void>;
  // Goals & Profile
  saveGoals: (goals: Partial<RecruitingGoals>) => Promise<void>;
  saveProfile: (profile: Partial<UserProfile>) => Promise<void>;
  // Banks
  saveBank: (bank: Partial<BankProfile>) => Promise<void>;
  toggleBankTarget: (id: string) => Promise<void>;
  // Utilities
  resetToSampleData: () => Promise<void>;
  exportCsv: (type: 'contacts' | 'applications') => void;
  importCsv: (type: 'contacts' | 'applications', csvText: string) => Promise<{ count: number }>;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEY = 'ib_recruiting_hub_state_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(() => {
    // Try localStorage first for instant paint
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) return JSON.parse(cached);
    } catch (e) {
      console.warn('Could not read cached state:', e);
    }
    return initialSeedData;
  });

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [filters, setFilters] = useState<FilterState>({});

  // Sync to API on mount and persist
  useEffect(() => {
    async function fetchState() {
      try {
        const res = await fetch('/api/state');
        if (res.ok) {
          const remoteState = await res.json();
          if (remoteState && remoteState.contacts) {
            setState(remoteState);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(remoteState));
          }
        }
      } catch (err) {
        console.warn('API fetch failed, using local/fallback state:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchState();
  }, []);

  const persistState = (newState: AppState) => {
    setState(newState);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      fetch('/api/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newState),
      }).catch((e) => console.warn('Background sync error:', e));
    } catch (e) {
      console.error('Persistence error:', e);
    }
  };

  const navigateWithFilter = (tab: NavigationTab, filterOverrides: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...filterOverrides }));
    setActiveTab(tab);
  };

  // Contacts
  const saveContact = async (contactInput: Partial<Contact>): Promise<Contact> => {
    const isNew = !contactInput.id;
    const newId = contactInput.id || 'c_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const fullName = `${contactInput.firstName || ''} ${contactInput.lastName || ''}`.trim();
    
    const contact: Contact = {
      id: newId,
      firstName: contactInput.firstName || 'New',
      lastName: contactInput.lastName || 'Contact',
      fullName: fullName || 'New Contact',
      bank: contactInput.bank || 'Evercore',
      firmType: contactInput.firmType || 'Elite Boutique',
      division: contactInput.division || 'Investment Banking',
      group: contactInput.group || 'Generalist M&A',
      jobTitle: contactInput.jobTitle || 'Analyst',
      seniority: contactInput.seniority || 'Analyst',
      school: contactInput.school || state.userProfile.university,
      gradYear: contactInput.gradYear || 2025,
      location: contactInput.location || 'New York, NY',
      email: contactInput.email || '',
      linkedinUrl: contactInput.linkedinUrl || '',
      howFound: contactInput.howFound || 'Alumni Database',
      referralSource: contactInput.referralSource || '',
      connectionStatus: contactInput.connectionStatus || 'Identified',
      relationshipStrength: contactInput.relationshipStrength || 1,
      dateAdded: contactInput.dateAdded || new Date().toISOString().split('T')[0],
      lastContactedDate: contactInput.lastContactedDate || null,
      nextFollowUpDate: contactInput.nextFollowUpDate || null,
      notes: contactInput.notes || '',
      tags: contactInput.tags || [],
    };

    const nextContacts = isNew
      ? [contact, ...state.contacts]
      : state.contacts.map((c) => (c.id === contact.id ? contact : c));

    const nextState = { ...state, contacts: nextContacts };
    persistState(nextState);

    fetch('/api/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contact),
    }).catch((e) => console.warn(e));

    return contact;
  };

  const deleteContact = async (id: string) => {
    const nextContacts = state.contacts.filter((c) => c.id !== id);
    const nextInteractions = state.interactions.filter((i) => i.contactId !== id);
    const nextApps = state.applications.map((a) => ({
      ...a,
      referralContactId: a.referralContactId === id ? null : a.referralContactId,
      associatedContactIds: a.associatedContactIds.filter((cid) => cid !== id),
    }));
    const nextTasks = state.tasks.map((t) => ({
      ...t,
      contactId: t.contactId === id ? null : t.contactId,
    }));

    const nextState: AppState = {
      ...state,
      contacts: nextContacts,
      interactions: nextInteractions,
      applications: nextApps,
      tasks: nextTasks,
    };
    persistState(nextState);

    fetch(`/api/contacts/${id}`, { method: 'DELETE' }).catch((e) => console.warn(e));
  };

  // Interactions
  const saveInteraction = async (input: Partial<Interaction>): Promise<Interaction> => {
    const isNew = !input.id;
    const newId = input.id || 'int_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    
    const interaction: Interaction = {
      id: newId,
      contactId: input.contactId || '',
      date: input.date || new Date().toISOString().split('T')[0],
      interactionType: input.interactionType || 'Phone Call',
      durationMinutes: input.durationMinutes || 20,
      keyTakeaways: input.keyTakeaways || '',
      personalDetails: input.personalDetails || '',
      adviceReceived: input.adviceReceived || '',
      recruitingInsights: input.recruitingInsights || '',
      questionsAsked: input.questionsAsked || '',
      followUpAction: input.followUpAction || '',
      followUpDeadline: input.followUpDeadline || null,
      thankYouEmailSent: input.thankYouEmailSent ?? true,
      createdAt: input.createdAt || new Date().toISOString(),
    };

    const nextInteractions = isNew
      ? [interaction, ...state.interactions]
      : state.interactions.map((i) => (i.id === interaction.id ? interaction : i));

    // Update parent contact
    const nextContacts = state.contacts.map((c) => {
      if (c.id === interaction.contactId) {
        const lastDate = !c.lastContactedDate || interaction.date >= c.lastContactedDate ? interaction.date : c.lastContactedDate;
        const nextDate = interaction.followUpDeadline || c.nextFollowUpDate;
        const status = c.connectionStatus === 'Identified' || c.connectionStatus === 'Outreach Sent' ? 'Spoke' : c.connectionStatus;
        return {
          ...c,
          lastContactedDate: lastDate,
          nextFollowUpDate: nextDate,
          connectionStatus: status as Contact['connectionStatus'],
        };
      }
      return c;
    });

    const nextState = {
      ...state,
      interactions: nextInteractions,
      contacts: nextContacts,
    };
    persistState(nextState);

    fetch('/api/interactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(interaction),
    }).catch((e) => console.warn(e));

    return interaction;
  };

  const deleteInteraction = async (id: string) => {
    const nextInteractions = state.interactions.filter((i) => i.id !== id);
    const nextState = { ...state, interactions: nextInteractions };
    persistState(nextState);
    fetch(`/api/interactions/${id}`, { method: 'DELETE' }).catch((e) => console.warn(e));
  };

  // Applications
  const saveApplication = async (input: Partial<Application>): Promise<Application> => {
    const isNew = !input.id;
    const newId = input.id || 'app_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);

    const appItem: Application = {
      id: newId,
      bank: input.bank || 'Evercore',
      firmType: input.firmType || 'Elite Boutique',
      positionTitle: input.positionTitle || '2027 Summer Analyst - Investment Banking',
      division: input.division || 'Investment Banking',
      group: input.group || 'Generalist M&A',
      internshipProgram: input.internshipProgram || 'Summer Analyst Internship',
      location: input.location || 'New York, NY',
      recruitingCycle: input.recruitingCycle || 'Summer 2027',
      applicationUrl: input.applicationUrl || '',
      applicationDeadline: input.applicationDeadline || '2026-12-01',
      dateApplied: input.dateApplied || null,
      status: input.status || 'Interested',
      resumeVersionUsed: input.resumeVersionUsed || state.userProfile.currentResumeVersion,
      coverLetterVersionUsed: input.coverLetterVersionUsed || '',
      referralContactId: input.referralContactId || null,
      associatedContactIds: input.associatedContactIds || [],
      recruiterContact: input.recruiterContact || '',
      interviewDates: input.interviewDates || [],
      notes: input.notes || '',
      nextAction: input.nextAction || '',
      nextActionDeadline: input.nextActionDeadline || null,
    };

    const nextApps = isNew
      ? [appItem, ...state.applications]
      : state.applications.map((a) => (a.id === appItem.id ? appItem : a));

    const nextState = { ...state, applications: nextApps };
    persistState(nextState);

    fetch('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(appItem),
    }).catch((e) => console.warn(e));

    return appItem;
  };

  const deleteApplication = async (id: string) => {
    const nextApps = state.applications.filter((a) => a.id !== id);
    const nextInterviews = state.interviews.map((inv) =>
      inv.applicationId === id ? { ...inv, applicationId: null } : inv
    );
    const nextTasks = state.tasks.map((t) => (t.applicationId === id ? { ...t, applicationId: null } : t));

    const nextState = {
      ...state,
      applications: nextApps,
      interviews: nextInterviews,
      tasks: nextTasks,
    };
    persistState(nextState);
    fetch(`/api/applications/${id}`, { method: 'DELETE' }).catch((e) => console.warn(e));
  };

  const updateApplicationStatus = async (id: string, status: Application['status']) => {
    const appItem = state.applications.find((a) => a.id === id);
    if (!appItem) return;
    const dateApplied =
      status === 'Applied' && !appItem.dateApplied
        ? new Date().toISOString().split('T')[0]
        : appItem.dateApplied;

    const updated = { ...appItem, status, dateApplied };
    await saveApplication(updated);
  };

  // Documents
  const saveDocument = async (input: Partial<DocumentItem>): Promise<DocumentItem> => {
    const isNew = !input.id;
    const newId = input.id || 'doc_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const today = new Date().toISOString().split('T')[0];

    const doc: DocumentItem = {
      id: newId,
      title: input.title || 'Untitled Document',
      category: input.category || 'Resume',
      bankAssociation: input.bankAssociation || null,
      dateCreated: input.dateCreated || today,
      lastUpdated: today,
      tags: input.tags || [],
      fileName: input.fileName || null,
      fileSize: input.fileSize || null,
      fileData: input.fileData || null,
      notes: input.notes || '',
      content: input.content || '',
      linkedApplicationId: input.linkedApplicationId || null,
      linkedContactId: input.linkedContactId || null,
      linkedInterviewId: input.linkedInterviewId || null,
    };

    const nextDocs = isNew
      ? [doc, ...state.documents]
      : state.documents.map((d) => (d.id === doc.id ? doc : d));

    const nextState = { ...state, documents: nextDocs };
    persistState(nextState);

    fetch('/api/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(doc),
    }).catch((e) => console.warn(e));

    return doc;
  };

  const deleteDocument = async (id: string) => {
    const nextDocs = state.documents.filter((d) => d.id !== id);
    const nextState = { ...state, documents: nextDocs };
    persistState(nextState);
    fetch(`/api/documents/${id}`, { method: 'DELETE' }).catch((e) => console.warn(e));
  };

  // Interviews
  const saveInterview = async (input: Partial<InterviewRecord>): Promise<InterviewRecord> => {
    const isNew = !input.id;
    const newId = input.id || 'intv_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);

    const interview: InterviewRecord = {
      id: newId,
      bank: input.bank || 'Evercore',
      position: input.position || '2027 Summer Analyst',
      applicationId: input.applicationId || null,
      interviewDate: input.interviewDate || new Date().toISOString().split('T')[0],
      interviewRound: input.interviewRound || 'First Round',
      interviewFormat: input.interviewFormat || 'Virtual Superday (Zoom/Teams)',
      interviewerNames: input.interviewerNames || '',
      interviewerRoles: input.interviewerRoles || '',
      technicalQuestions: input.technicalQuestions || '',
      behavioralQuestions: input.behavioralQuestions || '',
      questionsStruggledWith: input.questionsStruggledWith || '',
      questionsAnsweredWell: input.questionsAnsweredWell || '',
      feedback: input.feedback || '',
      preparationNotes: input.preparationNotes || '',
      nextSteps: input.nextSteps || '',
      status: input.status || 'Scheduled',
    };

    const nextInterviews = isNew
      ? [interview, ...state.interviews]
      : state.interviews.map((inv) => (inv.id === interview.id ? interview : inv));

    // Update associated application interviewDates if needed
    let nextApps = state.applications;
    if (interview.applicationId) {
      nextApps = nextApps.map((a) => {
        if (a.id === interview.applicationId) {
          const dates = Array.from(new Set([...a.interviewDates, interview.interviewDate])).sort();
          return { ...a, interviewDates: dates };
        }
        return a;
      });
    }

    const nextState = { ...state, interviews: nextInterviews, applications: nextApps };
    persistState(nextState);

    fetch('/api/interviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(interview),
    }).catch((e) => console.warn(e));

    return interview;
  };

  const deleteInterview = async (id: string) => {
    const nextInterviews = state.interviews.filter((i) => i.id !== id);
    const nextState = { ...state, interviews: nextInterviews };
    persistState(nextState);
    fetch(`/api/interviews/${id}`, { method: 'DELETE' }).catch((e) => console.warn(e));
  };

  // Prep Question
  const updatePrepQuestion = async (id: string, updates: Partial<PrepQuestion>) => {
    const nextQuestions = state.prepQuestions.map((q) => {
      if (q.id === id) {
        return {
          ...q,
          ...updates,
          lastPracticed: updates.status ? new Date().toISOString().split('T')[0] : q.lastPracticed,
        };
      }
      return q;
    });
    const nextState = { ...state, prepQuestions: nextQuestions };
    persistState(nextState);

    const target = nextQuestions.find((q) => q.id === id);
    if (target) {
      fetch('/api/prep-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(target),
      }).catch((e) => console.warn(e));
    }
  };

  // Tasks
  const saveTask = async (input: Partial<TaskItem>): Promise<TaskItem> => {
    const isNew = !input.id;
    const newId = input.id || 't_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);

    const task: TaskItem = {
      id: newId,
      title: input.title || 'Recruiting task',
      type: input.type || 'Follow up with contact',
      contactId: input.contactId || null,
      bank: input.bank || null,
      applicationId: input.applicationId || null,
      dueDate: input.dueDate || new Date().toISOString().split('T')[0],
      priority: input.priority || 'Medium',
      status: input.status || 'Pending',
      notes: input.notes || '',
    };

    const nextTasks = isNew
      ? [task, ...state.tasks]
      : state.tasks.map((t) => (t.id === task.id ? task : t));

    const nextState = { ...state, tasks: nextTasks };
    persistState(nextState);

    fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task),
    }).catch((e) => console.warn(e));

    return task;
  };

  const deleteTask = async (id: string) => {
    const nextTasks = state.tasks.filter((t) => t.id !== id);
    const nextState = { ...state, tasks: nextTasks };
    persistState(nextState);
    fetch(`/api/tasks/${id}`, { method: 'DELETE' }).catch((e) => console.warn(e));
  };

  const toggleTaskStatus = async (id: string) => {
    const target = state.tasks.find((t) => t.id === id);
    if (!target) return;
    const newStatus = target.status === 'Completed' ? 'Pending' : 'Completed';
    await saveTask({ ...target, status: newStatus });
  };

  // Goals & Profile
  const saveGoals = async (goalsUpdate: Partial<RecruitingGoals>) => {
    const nextGoals = { ...state.goals, ...goalsUpdate };
    const nextState = { ...state, goals: nextGoals };
    persistState(nextState);
    fetch('/api/goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nextGoals),
    }).catch((e) => console.warn(e));
  };

  const saveProfile = async (profileUpdate: Partial<UserProfile>) => {
    const nextProfile = { ...state.userProfile, ...profileUpdate };
    const nextState = { ...state, userProfile: nextProfile };
    persistState(nextState);
    fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nextProfile),
    }).catch((e) => console.warn(e));
  };

  // Banks
  const saveBank = async (bankInput: Partial<BankProfile>) => {
    const isNew = !bankInput.id;
    const newId = bankInput.id || 'b_' + Date.now();
    const bankItem: BankProfile = {
      id: newId,
      name: bankInput.name || 'New Bank',
      firmType: bankInput.firmType || 'Bulge Bracket',
      headquarters: bankInput.headquarters || 'New York, NY',
      keyOffices: bankInput.keyOffices || ['New York'],
      notableGroups: bankInput.notableGroups || ['M&A'],
      recruitingTimeline: bankInput.recruitingTimeline || 'Rolling fall applications',
      internshipProgram: bankInput.internshipProgram || 'Summer Analyst Program',
      applicationUrl: bankInput.applicationUrl || '',
      keyRecruitingContacts: bankInput.keyRecruitingContacts || '',
      networkingNotes: bankInput.networkingNotes || '',
      cultureNotes: bankInput.cultureNotes || '',
      interviewProcess: bankInput.interviewProcess || '',
      technicalDifficulty: bankInput.technicalDifficulty || 'Standard',
      researchNotes: bankInput.researchNotes || '',
      isTarget: bankInput.isTarget ?? true,
      priorityTier: bankInput.priorityTier || 'Tier 2 (Target)',
    };

    const nextBanks = isNew
      ? [bankItem, ...state.banks]
      : state.banks.map((b) => (b.id === bankItem.id ? bankItem : b));

    const nextState = { ...state, banks: nextBanks };
    persistState(nextState);

    fetch('/api/banks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bankItem),
    }).catch((e) => console.warn(e));
  };

  const toggleBankTarget = async (id: string) => {
    const bank = state.banks.find((b) => b.id === id);
    if (!bank) return;
    await saveBank({ ...bank, isTarget: !bank.isTarget });
  };

  // Reset
  const resetToSampleData = async () => {
    setState(initialSeedData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialSeedData));
    try {
      await fetch('/api/reset', { method: 'POST' });
    } catch (e) {
      console.warn(e);
    }
  };

  // CSV Export & Import
  const exportCsv = (type: 'contacts' | 'applications') => {
    window.location.href = `/api/export-csv/${type}`;
  };

  const importCsv = async (type: 'contacts' | 'applications', csvText: string): Promise<{ count: number }> => {
    const lines = csvText.trim().split(/\r?\n/);
    if (lines.length < 2) return { count: 0 };
    
    // Parse header and rows with quotes support
    const parseLine = (line: string): string[] => {
      const result: string[] = [];
      let cur = '';
      let insideQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const c = line[i];
        if (c === '"') {
          if (insideQuotes && line[i + 1] === '"') {
            cur += '"';
            i++;
          } else {
            insideQuotes = !insideQuotes;
          }
        } else if (c === ',' && !insideQuotes) {
          result.push(cur.trim());
          cur = '';
        } else {
          cur += c;
        }
      }
      result.push(cur.trim());
      return result;
    };

    const header = parseLine(lines[0]).map((h) => h.toLowerCase());
    const dataRows = lines.slice(1).map(parseLine);
    let importedCount = 0;

    if (type === 'contacts') {
      const newContacts: Contact[] = [];
      dataRows.forEach((row, idx) => {
        if (!row || row.length === 0 || !row[0]) return;
        const firstName = row[1] || row[0] || 'Unknown';
        const lastName = row[2] || '';
        const bank = row[3] || 'Investment Bank';
        const firmType = (row[4] as Contact['firmType']) || 'Bulge Bracket';
        const division = row[5] || 'Investment Banking';
        const group = row[6] || 'M&A';
        const jobTitle = row[7] || 'Analyst';
        const seniority = (row[8] as Contact['seniority']) || 'Analyst';
        const school = row[9] || state.userProfile.university;
        const gradYear = parseInt(row[10] || '2026', 10) || 2026;
        const location = row[11] || 'New York, NY';
        const email = row[12] || '';
        const linkedinUrl = row[13] || '';
        const howFound = row[14] || 'CSV Import';
        const referralSource = row[15] || '';
        const connectionStatus = (row[16] as Contact['connectionStatus']) || 'Identified';
        const strength = parseInt(row[17] || '2', 10) as 1 | 2 | 3 | 4 | 5;
        const dateAdded = row[18] || new Date().toISOString().split('T')[0];
        const lastContacted = row[19] || null;
        const nextFollowUp = row[20] || null;
        const notes = row[21] || 'Imported via CSV';

        const contact: Contact = {
          id: 'c_imp_' + Date.now() + '_' + idx,
          firstName,
          lastName,
          fullName: `${firstName} ${lastName}`.trim(),
          bank,
          firmType,
          division,
          group,
          jobTitle,
          seniority,
          school,
          gradYear,
          location,
          email,
          linkedinUrl,
          howFound,
          referralSource,
          connectionStatus,
          relationshipStrength: strength >= 1 && strength <= 5 ? strength : 2,
          dateAdded,
          lastContactedDate: lastContacted,
          nextFollowUpDate: nextFollowUp,
          notes,
          tags: ['CSV Import'],
        };
        newContacts.push(contact);
        importedCount++;
      });

      if (newContacts.length > 0) {
        const nextState = { ...state, contacts: [...newContacts, ...state.contacts] };
        persistState(nextState);
      }
    } else if (type === 'applications') {
      const newApps: Application[] = [];
      dataRows.forEach((row, idx) => {
        if (!row || row.length === 0 || !row[0]) return;
        const bank = row[1] || row[0] || 'Target Bank';
        const firmType = (row[2] as Application['firmType']) || 'Bulge Bracket';
        const positionTitle = row[3] || '2027 Summer Analyst - Investment Banking';
        const division = row[4] || 'Investment Banking';
        const group = row[5] || 'M&A';
        const internshipProgram = row[6] || 'Summer Analyst';
        const location = row[7] || 'New York, NY';
        const recruitingCycle = row[8] || 'Summer 2027';
        const status = (row[9] as Application['status']) || 'Applied';
        const deadline = row[10] || '2026-12-01';
        const dateApplied = row[11] || new Date().toISOString().split('T')[0];
        const notes = row[15] || 'Imported via CSV';

        const app: Application = {
          id: 'app_imp_' + Date.now() + '_' + idx,
          bank,
          firmType,
          positionTitle,
          division,
          group,
          internshipProgram,
          location,
          recruitingCycle,
          applicationUrl: '',
          applicationDeadline: deadline,
          dateApplied,
          status,
          resumeVersionUsed: state.userProfile.currentResumeVersion,
          coverLetterVersionUsed: '',
          referralContactId: null,
          associatedContactIds: [],
          recruiterContact: '',
          interviewDates: [],
          notes,
          nextAction: 'Review application status',
          nextActionDeadline: null,
        };
        newApps.push(app);
        importedCount++;
      });

      if (newApps.length > 0) {
        const nextState = { ...state, applications: [...newApps, ...state.applications] };
        persistState(nextState);
      }
    }

    return { count: importedCount };
  };

  return (
    <AppContext.Provider
      value={{
        state,
        loading,
        activeTab,
        setActiveTab,
        filters,
        setFilters,
        navigateWithFilter,
        saveContact,
        deleteContact,
        saveInteraction,
        deleteInteraction,
        saveApplication,
        deleteApplication,
        updateApplicationStatus,
        saveDocument,
        deleteDocument,
        saveInterview,
        deleteInterview,
        updatePrepQuestion,
        saveTask,
        deleteTask,
        toggleTaskStatus,
        saveGoals,
        saveProfile,
        saveBank,
        toggleBankTarget,
        resetToSampleData,
        exportCsv,
        importCsv,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
