export type FirmType =
  | 'Bulge Bracket'
  | 'Elite Boutique'
  | 'Middle Market'
  | 'Regional Boutique'
  | 'Independent Advisory Firm';

export type Seniority = 'Analyst' | 'Associate' | 'VP' | 'Director' | 'MD' | 'Recruiter';

export type ConnectionStatus =
  | 'Identified'
  | 'Outreach Sent'
  | 'Connected'
  | 'Call Scheduled'
  | 'Spoke'
  | 'Warm Relationship'
  | 'Strong Advocate'
  | 'Unresponsive';

export type InteractionType =
  | 'Email'
  | 'LinkedIn'
  | 'Phone Call'
  | 'Zoom'
  | 'In-Person Coffee Chat'
  | 'Information Session';

export interface Interaction {
  id: string;
  contactId: string;
  date: string;
  interactionType: InteractionType;
  durationMinutes: number;
  keyTakeaways: string;
  personalDetails: string;
  adviceReceived: string;
  recruitingInsights: string;
  questionsAsked: string;
  followUpAction: string;
  followUpDeadline: string | null;
  thankYouEmailSent: boolean;
  createdAt: string;
}

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  bank: string;
  firmType: FirmType;
  division: string;
  group: string;
  jobTitle: string;
  seniority: Seniority;
  school: string;
  gradYear: number;
  location: string;
  email: string;
  linkedinUrl: string;
  howFound: string;
  referralSource: string;
  connectionStatus: ConnectionStatus;
  relationshipStrength: 1 | 2 | 3 | 4 | 5; // 1 = Cold, 5 = Champion
  dateAdded: string;
  lastContactedDate: string | null;
  nextFollowUpDate: string | null;
  notes: string;
  tags: string[];
}

export type ApplicationStatus =
  | 'Interested'
  | 'Researching'
  | 'Networking'
  | 'Preparing to Apply'
  | 'Applied'
  | 'Referral Requested'
  | 'Referral Received'
  | 'Online Assessment'
  | 'First Round'
  | 'Superday'
  | 'Offer'
  | 'Rejected'
  | 'Withdrawn';

export interface Application {
  id: string;
  bank: string;
  firmType: FirmType;
  positionTitle: string;
  division: string;
  group: string;
  internshipProgram: string;
  location: string;
  recruitingCycle: string;
  applicationUrl: string;
  applicationDeadline: string;
  dateApplied: string | null;
  status: ApplicationStatus;
  resumeVersionUsed: string;
  coverLetterVersionUsed: string;
  referralContactId: string | null;
  associatedContactIds: string[];
  recruiterContact: string;
  interviewDates: string[];
  notes: string;
  nextAction: string;
  nextActionDeadline: string | null;
}

export type DocumentCategory =
  | 'Resume'
  | 'Cover Letter'
  | 'Networking Email Template'
  | 'Thank-You Email Template'
  | 'Stock Pitch'
  | 'Technical Guide'
  | 'Behavioral Prep'
  | 'Bank Research'
  | 'Interview Notes'
  | 'Networking Notes'
  | 'Financial Modeling Resource'
  | 'Recruiting Timeline';

export interface DocumentItem {
  id: string;
  title: string;
  category: DocumentCategory;
  bankAssociation: string | null;
  dateCreated: string;
  lastUpdated: string;
  tags: string[];
  fileName: string | null;
  fileSize: string | null;
  fileData?: string | null;
  notes: string;
  content: string;
  linkedApplicationId: string | null;
  linkedContactId: string | null;
  linkedInterviewId: string | null;
}

export type InterviewRound =
  | 'Screen / Coffee Chat'
  | 'First Round'
  | 'Second Round'
  | 'Superday'
  | 'Final Round';

export type InterviewFormat =
  | 'HireVue / Video'
  | 'Phone'
  | 'Virtual Superday (Zoom/Teams)'
  | 'In-Person Superday'
  | 'Coffee Chat Screen';

export interface InterviewRecord {
  id: string;
  bank: string;
  position: string;
  applicationId: string | null;
  interviewDate: string;
  interviewRound: InterviewRound;
  interviewFormat: InterviewFormat;
  interviewerNames: string;
  interviewerRoles: string;
  technicalQuestions: string;
  behavioralQuestions: string;
  questionsStruggledWith: string;
  questionsAnsweredWell: string;
  feedback: string;
  preparationNotes: string;
  nextSteps: string;
  status: 'Scheduled' | 'Completed' | 'Passed' | 'Offer Extended' | 'Did Not Advance';
}

export type QuestionCategory =
  | 'Accounting'
  | 'Valuation'
  | 'DCF'
  | 'Enterprise Value vs. Equity Value'
  | 'M&A'
  | 'LBO'
  | 'Financial Modeling'
  | 'Behavioral'
  | 'Market Awareness'
  | 'Bank-Specific Questions';

export type QuestionStatus = 'Not Started' | 'Practicing' | 'Confident' | 'Needs Review';

export interface PrepQuestion {
  id: string;
  category: QuestionCategory;
  question: string;
  idealAnswer: string;
  keyConcepts: string[];
  difficulty: 'Core / Standard' | 'Advanced' | 'Elite Boutique / Nuanced';
  status: QuestionStatus;
  userNotes: string;
  lastPracticed: string | null;
}

export type TaskType =
  | 'Send networking email'
  | 'Follow up with contact'
  | 'Send thank-you email'
  | 'Submit application'
  | 'Prepare for interview'
  | 'Complete online assessment'
  | 'Research bank'
  | 'Update resume'
  | 'Practice technical questions'
  | 'Other';

export interface TaskItem {
  id: string;
  title: string;
  type: TaskType;
  contactId: string | null;
  bank: string | null;
  applicationId: string | null;
  dueDate: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Pending' | 'In Progress' | 'Completed';
  notes: string;
}

export interface BankProfile {
  id: string;
  name: string;
  firmType: FirmType;
  headquarters: string;
  keyOffices: string[];
  notableGroups: string[];
  recruitingTimeline: string;
  internshipProgram: string;
  applicationUrl: string;
  keyRecruitingContacts: string;
  networkingNotes: string;
  cultureNotes: string;
  interviewProcess: string;
  technicalDifficulty: 'Standard' | 'High' | 'Very High' | 'Rigorous Modeling';
  researchNotes: string;
  isTarget: boolean;
  priorityTier: 'Tier 1 (Dream)' | 'Tier 2 (Target)' | 'Tier 3 (Safety / Select)';
}

export interface RecruitingGoals {
  weeklyConversationsTarget: number;
  weeklyNewContactsTarget: number;
  weeklyApplicationsTarget: number;
  weeklyTechnicalSessionsTarget: number;
  followUpHoursTarget: number; // e.g. 24h
  targetOffers: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  university: string;
  major: string;
  graduationYear: number;
  gpa: string;
  targetCycle: string;
  targetLocations: string[];
  preferredGroups: string[];
  currentResumeVersion: string;
}

export interface AppState {
  userProfile: UserProfile;
  contacts: Contact[];
  interactions: Interaction[];
  applications: Application[];
  documents: DocumentItem[];
  interviews: InterviewRecord[];
  prepQuestions: PrepQuestion[];
  tasks: TaskItem[];
  banks: BankProfile[];
  goals: RecruitingGoals;
}
