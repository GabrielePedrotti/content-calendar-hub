export type ContentType = 'video' | 'short' | 'live' | 'reel' | 'post' | 'podcast';
export type Priority = 'low' | 'medium' | 'high';

export interface CategoryFeatures {
  notes: boolean;
  pipeline: boolean;
  checklist: boolean;
  priority: boolean;
  contentType: boolean;
  linkedContent: boolean;
}

export const DEFAULT_CATEGORY_FEATURES: CategoryFeatures = {
  notes: true,
  pipeline: true,
  checklist: true,
  priority: true,
  contentType: true,
  linkedContent: true,
};

export interface Category {
  id: string;
  name: string;
  color: string; // HSL format: "142 76% 45%"
  order?: number;
  features?: CategoryFeatures;
}

export interface PipelineStage {
  id: string;
  name: string;
  order: number;
  color?: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
  isDone: boolean;
  order: number;
  dueDate?: Date;
}

export interface ContentItem {
  id: string;
  title: string;
  categoryId: string;
  date: Date;
  published: boolean;
  notes?: string;
  linkedContentId?: string;
  // New fields for pipeline system
  contentType?: ContentType;
  pipelineStageId?: string;
  priority?: Priority;
  checklist?: ChecklistItem[];
  parentId?: string; // For shorts linked to parent video
  seriesId?: string;
  templateId?: string;
  durationEstimate?: number; // in minutes
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

export interface VacationPeriod {
  id: string;
  startDate: Date;
  endDate: Date;
  label: string;
}

// Template system
export interface ContentTemplate {
  id: string;
  name: string;
  contentType: ContentType;
  defaultCategoryId?: string;
  titlePrefix?: string;
  titleSuffix?: string;
  namingRule?: string; // e.g. "-Short {i}: {parent_title}"
  defaultPipeline: PipelineStage[];
  defaultChecklist: Omit<ChecklistItem, 'id' | 'isDone'>[];
  durationEstimate?: number;
}

// Series system (advanced repetitions)
export interface Series {
  id: string;
  name: string;
  templateId: string;
  pattern: 'daily' | 'weekdays' | 'weekly' | 'biweekly' | 'monthly';
  startDate: Date;
  endDate?: Date;
  occurrencesCount?: number;
  options: {
    skipWeekends?: boolean;
    avoidConflicts?: boolean;
    titlePattern?: string; // e.g. "{series_name} Ep. {n}"
  };
  isActive: boolean;
  currentNumber: number;
}

// Shorts preset system
export interface ShortsPreset {
  id: string;
  name: string;
  shortsCount: number;
  offsets: number[]; // Days after parent video, e.g. [1, 2, 3]
  shortTemplateId?: string;
  shortCategoryId?: string;
  titleRule: string; // e.g. "-Short {i}: {parent_title}"
  defaultTime?: string; // e.g. "14:00"
}

// Default pipeline stages
export const DEFAULT_PIPELINE_STAGES: PipelineStage[] = [
  { id: 'idea', name: 'Idea', order: 0, color: '220 15% 50%' },
  { id: 'script', name: 'Script', order: 1, color: '45 95% 50%' },
  { id: 'recording', name: 'Registrazione', order: 2, color: '25 95% 53%' },
  { id: 'editing', name: 'Editing', order: 3, color: '270 60% 55%' },
  { id: 'thumbnail', name: 'Thumbnail', order: 4, color: '300 70% 55%' },
  { id: 'upload', name: 'Upload', order: 5, color: '210 100% 50%' },
  { id: 'published', name: 'Pubblicato', order: 6, color: '142 76% 45%' },
];

// Default checklist items for video
export const DEFAULT_VIDEO_CHECKLIST: Omit<ChecklistItem, 'id' | 'isDone'>[] = [
  { label: 'Scrivere script', order: 0 },
  { label: 'Preparare setup', order: 1 },
  { label: 'Registrare video', order: 2 },
  { label: 'Montaggio base', order: 3 },
  { label: 'Aggiungere musica/effetti', order: 4 },
  { label: 'Creare thumbnail', order: 5 },
  { label: 'Scrivere titolo e descrizione', order: 6 },
  { label: 'Upload e programmazione', order: 7 },
];

// Content type labels
export const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  video: 'Video',
  short: 'Short',
  live: 'Live',
  reel: 'Reel',
  post: 'Post',
  podcast: 'Podcast',
};

// Priority labels and colors
export const PRIORITY_CONFIG: Record<Priority, { label: string; color: string }> = {
  low: { label: 'Bassa', color: '142 76% 45%' },
  medium: { label: 'Media', color: '45 95% 50%' },
  high: { label: 'Alta', color: '0 70% 55%' },
};
