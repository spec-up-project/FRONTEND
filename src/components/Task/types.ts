export interface WeeklyReport {
  id: string;
  title: string;
  date: string;
  status: 'REQUEST' | 'COMPLETE' | 'ERROR';
  type: 'record' | 'summary';
}

export interface ScheduleDetail {
  scheduleUid: string;
  title: string;
  content: string;
  startTime: string;
  endTime: string;
  rawText: string;
  isAllDay: boolean;
  mainCategory: string;
  subCategory: string;
  source: string;
  createDate: string;
  modifyDate: string;
}

export interface TaskPageProps {
  onLogout: () => void;
  user: { email: string; name?: string } | null;
  onBackToPlan?: () => void;
  onCalendarClick?: () => void;
  currentPage?: 'calendar' | 'task';
}
