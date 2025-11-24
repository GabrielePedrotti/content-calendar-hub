export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface ContentItem {
  id: string;
  title: string;
  categoryId: string;
  date: Date;
  published?: boolean;
}

export interface WeekDay {
  date: Date;
  dayName: string;
  dayNumber: number;
  isSunday: boolean;
}
