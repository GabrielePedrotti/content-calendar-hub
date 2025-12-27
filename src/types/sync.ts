import { Category, ContentItem, VacationPeriod } from './planner';
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
  | 'vacation:delete';

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
}

export interface SyncState {
  pendingEvents: ClientEvent[];
  lastSyncTimestamp: number;
  isConnected: boolean;
}
