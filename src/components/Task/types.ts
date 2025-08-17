export interface WeeklyReport {
  id: string;
  title: string;
  date: string;
  status: 'draft' | 'completed';
  type: 'record' | 'summary';
}

export interface TaskPageProps {
  onLogout: () => void;
  user: { email: string; name?: string } | null;
  onBackToPlan?: () => void;
  onCalendarClick?: () => void;
  currentPage?: 'calendar' | 'task';
}
