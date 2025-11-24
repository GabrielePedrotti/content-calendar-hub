export interface Category {
  id: string;
  name: string;
  color: string; // HSL format: "142 76% 45%"
}

export interface ContentItem {
  id: string;
  title: string;
  categoryId: string;
  date: Date;
  published: boolean;
  notes?: string;
  linkedContentId?: string;
}

export interface WeekDay {
  date: Date;
  dayName: string;
  dayNumber: number;
  isSunday: boolean;
}

export interface SeriesConfig {
  baseTitle: string;
  startNumber: number;
  endNumber: number;
  categoryId: string;
  startDate: Date;
  frequency: 'daily' | 'weekdays' | 'weekly';
}
