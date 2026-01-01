import { Category, ContentItem, VacationPeriod, ContentTemplate, Series } from './planner';
import { User } from './auth';

// Eventi che il client invia al server
export type ClientEventType = 
  | 'auth:login'
  | 'auth:logout'
  | 'data:request'
  | 'content:create'
  | 'content:update'
  | 'content:delete'
  | 'category:create'
  | 'category:update'
  | 'category:delete'
  | 'vacation:create'
  | 'vacation:delete'
  | 'template:create'
  | 'template:update'
  | 'template:delete'
  | 'series:create'
  | 'series:update'
  | 'series:delete';

// Eventi che il server invia al client
export type ServerEventType = 
  | 'auth:success'
  | 'auth:error'
  | 'data:initial'
  | 'content:created'
  | 'content:updated'
  | 'content:deleted'
  | 'category:created'
  | 'category:updated'
  | 'category:deleted'
  | 'vacation:created'
  | 'vacation:deleted'
  | 'template:created'
  | 'template:updated'
  | 'template:deleted'
  | 'series:created'
  | 'series:updated'
  | 'series:deleted'
  | 'error';

export interface ClientEvent {
  id: string;
  type: ClientEventType;
  payload: any;
  timestamp: number;
}

export interface ServerEvent {
  id: string;
  type: ServerEventType;
  payload: any;
  timestamp: number;
  userId?: string;
}

// Payload specifici
export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthSuccessPayload {
  user: User;
  token: string;
}

export interface InitialDataPayload {
  contents: ContentItem[];
  categories: Category[];
  vacations: VacationPeriod[];
  templates: ContentTemplate[];
  series: Series[];
}

export interface SyncState {
  pendingEvents: ClientEvent[];
  lastSyncTimestamp: number;
  isConnected: boolean;
}
