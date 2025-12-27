import { Category, ContentItem, VacationPeriod } from './planner';

export type SyncEventType = 
  | 'content:create'
  | 'content:update'
  | 'content:delete'
  | 'category:create'
  | 'category:update'
  | 'category:delete'
  | 'vacation:create'
  | 'vacation:delete';

export interface SyncEvent {
  id: string;
  type: SyncEventType;
  payload: ContentItem | Category | VacationPeriod | { id: string };
  timestamp: number;
  userId: string;
}

export interface SyncState {
  pendingEvents: SyncEvent[];
  lastSyncTimestamp: number;
  isConnected: boolean;
}
