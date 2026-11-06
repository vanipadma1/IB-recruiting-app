import { Application, Contact, Interaction, TaskItem } from '../types';

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const date = new Date(year, month, day);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

export function isPastDate(dateStr: string | null | undefined): boolean {
  if (!dateStr) return false;
  const today = new Date().toISOString().split('T')[0];
  return dateStr < today;
}

export function isToday(dateStr: string | null | undefined): boolean {
  if (!dateStr) return false;
  const today = new Date().toISOString().split('T')[0];
  return dateStr === today;
}

export function isWithinDays(dateStr: string | null | undefined, days: number): boolean {
  if (!dateStr) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays >= 0 && diffDays <= days;
}

export function calculateDashboardMetrics(
  contacts: Contact[],
  interactions: Interaction[],
  applications: Application[],
  tasks: TaskItem[]
) {
  const todayStr = new Date().toISOString().split('T')[0];
  
  // Weekly window: last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

  const totalContacts = contacts.length;
  const totalConversations = interactions.length;
  
  const totalInformationalInterviews = interactions.filter(
    (i) => i.interactionType === 'Phone Call' || i.interactionType === 'Zoom' || i.interactionType === 'In-Person Coffee Chat'
  ).length;

  const applicationsSubmitted = applications.filter((a) =>
    ['Applied', 'Referral Requested', 'Referral Received', 'Online Assessment', 'First Round', 'Superday', 'Offer', 'Rejected', 'Withdrawn'].includes(a.status) &&
    a.dateApplied !== null
  ).length;

  const applicationsInProgress = applications.filter((a) =>
    ['Interested', 'Researching', 'Networking', 'Preparing to Apply', 'Applied', 'Referral Requested', 'Referral Received', 'Online Assessment', 'First Round', 'Superday'].includes(a.status)
  ).length;

  const interviewsScheduled = applications.filter((a) =>
    ['Online Assessment', 'First Round', 'Superday'].includes(a.status)
  ).length;

  const offersReceived = applications.filter((a) => a.status === 'Offer').length;

  const followUpsDue = contacts.filter((c) => {
    if (!c.nextFollowUpDate) return false;
    return c.nextFollowUpDate <= todayStr;
  }).length;

  const conversationsThisWeek = interactions.filter((i) => i.date >= sevenDaysAgoStr).length;

  const applicationsThisWeek = applications.filter(
    (a) => a.dateApplied && a.dateApplied >= sevenDaysAgoStr
  ).length;

  return {
    totalContacts,
    totalConversations,
    totalInformationalInterviews,
    applicationsSubmitted,
    applicationsInProgress,
    interviewsScheduled,
    offersReceived,
    followUpsDue,
    conversationsThisWeek,
    applicationsThisWeek,
  };
}

export const IB_BANKS_SUGGESTIONS = [
  'Evercore',
  'Goldman Sachs',
  'Morgan Stanley',
  'Centerview Partners',
  'Moelis & Company',
  'PJT Partners',
  'J.P. Morgan',
  'Lazard',
  'Bank of America',
  'Citi',
  'Barclays',
  'Jefferies',
  'Houlihan Lokey',
  'Guggenheim Securities',
  'Perella Weinberg Partners',
  'Qatalyst Partners',
  'Rothschild & Co',
  'RBC Capital Markets',
  'Wells Fargo',
  'William Blair',
  'Piper Sandler',
  'Harris Williams',
  'Lincoln International',
  'Stephens Inc.',
];

export const IB_GROUPS_SUGGESTIONS = [
  'Generalist M&A',
  'TMT (Tech, Media, Telecom)',
  'Restructuring & Special Situations (RSSG/RX)',
  'Healthcare',
  'Financial Institutions Group (FIG)',
  'Industrials',
  'Consumer & Retail',
  'Energy & Clean Tech',
  'Real Estate, Gaming & Lodging (REGAL)',
  'Leveraged Finance (LevFin)',
  'Financial Sponsors',
];
