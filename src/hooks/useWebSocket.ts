import { useState, useCallback, useRef, useEffect } from 'react';
import { 
  ClientEvent, 
  ServerEvent, 
  ClientEventType,
  LoginPayload,
  InitialDataPayload,
  AuthSuccessPayload 
} from '@/types/sync';
import { User } from '@/types/auth';
import { Category, ContentItem, VacationPeriod } from '@/types/planner';

const AUTH_TOKEN_KEY = 'planner_auth_token';
const SYNC_STORAGE_KEY = 'planner_sync_queue';
const SYNC_DATA_KEY = 'planner_data';

interface UseWebSocketOptions {
  wsUrl: string | null;
  onAuthSuccess?: (user: User, token: string) => void;
  onAuthError?: (error: string) => void;
  onInitialData?: (data: InitialDataPayload) => void;
  onContentChange?: (type: 'created' | 'updated' | 'deleted', payload: ContentItem | { id: string }) => void;
  onCategoryChange?: (type: 'created' | 'updated' | 'deleted', payload: Category | { id: string }) => void;
  onVacationChange?: (type: 'created' | 'deleted', payload: VacationPeriod | { id: string }) => void;
  onError?: (error: string) => void;
}

export const useWebSocket = ({
  wsUrl,
  onAuthSuccess,
  onAuthError,
  onInitialData,
  onContentChange,
  onCategoryChange,
  onVacationChange,
  onError,
}: UseWebSocketOptions) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [pendingEvents, setPendingEvents] = useState<ClientEvent[]>(() => {
    const stored = localStorage.getItem(SYNC_STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return [];
      }
    }
    return [];
  });

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Salva eventi pendenti
  useEffect(() => {
    localStorage.setItem(SYNC_STORAGE_KEY, JSON.stringify(pendingEvents));
  }, [pendingEvents]);

  // Crea un evento client
  const createEvent = useCallback((type: ClientEventType, payload: any): ClientEvent => ({
    id: crypto.randomUUID(),
    type,
    payload,
    timestamp: Date.now(),
  }), []);

  // Invia evento al server
  const sendEvent = useCallback((event: ClientEvent) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(event));
      // Rimuovi dalla coda se inviato
      setPendingEvents(prev => prev.filter(e => e.id !== event.id));
    } else {
      // Aggiungi alla coda se non connesso
      setPendingEvents(prev => {
        if (prev.some(e => e.id === event.id)) return prev;
        return [...prev, event];
      });
    }
  }, []);

  // Gestisce messaggi dal server
  const handleServerEvent = useCallback((event: ServerEvent) => {
    console.log('Server event:', event);

    switch (event.type) {
      case 'auth:success':
        const authPayload = event.payload as AuthSuccessPayload;
        localStorage.setItem(AUTH_TOKEN_KEY, authPayload.token);
        onAuthSuccess?.(authPayload.user, authPayload.token);
        break;

      case 'auth:error':
        onAuthError?.(event.payload?.message || 'Errore di autenticazione');
        break;

      case 'data:initial':
        onInitialData?.(event.payload as InitialDataPayload);
        break;

      case 'content:created':
        onContentChange?.('created', event.payload as ContentItem);
        break;

      case 'content:updated':
        onContentChange?.('updated', event.payload as ContentItem);
        break;

      case 'content:deleted':
        onContentChange?.('deleted', event.payload as { id: string });
        break;

      case 'category:created':
        onCategoryChange?.('created', event.payload as Category);
        break;

      case 'category:updated':
        onCategoryChange?.('updated', event.payload as Category);
        break;

      case 'category:deleted':
        onCategoryChange?.('deleted', event.payload as { id: string });
        break;

      case 'vacation:created':
        onVacationChange?.('created', event.payload as VacationPeriod);
        break;

      case 'vacation:deleted':
        onVacationChange?.('deleted', event.payload as { id: string });
        break;

      case 'error':
        onError?.(event.payload?.message || 'Errore sconosciuto');
        break;
    }
  }, [onAuthSuccess, onAuthError, onInitialData, onContentChange, onCategoryChange, onVacationChange, onError]);

  // Connetti al WebSocket
  const connect = useCallback(() => {
    if (!wsUrl || wsRef.current?.readyState === WebSocket.OPEN) return;

    setIsConnecting(true);
    console.log('Connecting to WebSocket:', wsUrl);

    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      setIsConnecting(false);

      // Invia eventi pendenti
      pendingEvents.forEach(event => {
        wsRef.current?.send(JSON.stringify(event));
      });
      setPendingEvents([]);

      // Se abbiamo un token salvato, prova auto-login
      const savedToken = localStorage.getItem(AUTH_TOKEN_KEY);
      if (savedToken) {
        const event = createEvent('auth:login', { token: savedToken });
        wsRef.current?.send(JSON.stringify(event));
      }
    };

    wsRef.current.onmessage = (message) => {
      try {
        const event: ServerEvent = JSON.parse(message.data);
        handleServerEvent(event);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    wsRef.current.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
      setIsConnecting(false);

      // Auto-reconnect dopo 3 secondi
      reconnectTimeoutRef.current = setTimeout(() => {
        if (wsUrl) connect();
      }, 3000);
    };

    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnecting(false);
    };
  }, [wsUrl, pendingEvents, createEvent, handleServerEvent]);

  // Disconnetti
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    wsRef.current?.close();
    wsRef.current = null;
    setIsConnected(false);
  }, []);

  // Auto-connect quando wsUrl è disponibile
  useEffect(() => {
    if (wsUrl) {
      connect();
    }
    return () => {
      disconnect();
    };
  }, [wsUrl]);

  // === API per il client ===

  // Login via WebSocket
  const login = useCallback((email: string, password: string) => {
    const event = createEvent('auth:login', { email, password } as LoginPayload);
    sendEvent(event);
  }, [createEvent, sendEvent]);

  // Logout via WebSocket
  const logout = useCallback(() => {
    const event = createEvent('auth:logout', {});
    sendEvent(event);
    localStorage.removeItem(AUTH_TOKEN_KEY);
  }, [createEvent, sendEvent]);

  // Richiedi dati iniziali
  const requestData = useCallback(() => {
    const event = createEvent('data:request', {});
    sendEvent(event);
  }, [createEvent, sendEvent]);

  // === Content Events ===
  const syncContentCreate = useCallback((content: ContentItem) => {
    const event = createEvent('content:create', content);
    sendEvent(event);
  }, [createEvent, sendEvent]);

  const syncContentUpdate = useCallback((content: ContentItem) => {
    const event = createEvent('content:update', content);
    sendEvent(event);
  }, [createEvent, sendEvent]);

  const syncContentDelete = useCallback((contentId: string) => {
    const event = createEvent('content:delete', { id: contentId });
    sendEvent(event);
  }, [createEvent, sendEvent]);

  // === Category Events ===
  const syncCategoryCreate = useCallback((category: Category) => {
    const event = createEvent('category:create', category);
    sendEvent(event);
  }, [createEvent, sendEvent]);

  const syncCategoryUpdate = useCallback((category: Category) => {
    const event = createEvent('category:update', category);
    sendEvent(event);
  }, [createEvent, sendEvent]);

  const syncCategoryDelete = useCallback((categoryId: string) => {
    const event = createEvent('category:delete', { id: categoryId });
    sendEvent(event);
  }, [createEvent, sendEvent]);

  // === Vacation Events ===
  const syncVacationCreate = useCallback((vacation: VacationPeriod) => {
    const event = createEvent('vacation:create', vacation);
    sendEvent(event);
  }, [createEvent, sendEvent]);

  const syncVacationDelete = useCallback((vacationId: string) => {
    const event = createEvent('vacation:delete', { id: vacationId });
    sendEvent(event);
  }, [createEvent, sendEvent]);

  // Cache locale per fallback offline
  const saveToLocalCache = useCallback((data: Partial<InitialDataPayload>) => {
    const stored = localStorage.getItem(SYNC_DATA_KEY);
    let currentData: InitialDataPayload = { contents: [], categories: [], vacations: [] };
    if (stored) {
      try {
        currentData = JSON.parse(stored);
      } catch {}
    }
    const newData = { ...currentData, ...data };
    localStorage.setItem(SYNC_DATA_KEY, JSON.stringify(newData));
  }, []);

  const loadFromLocalCache = useCallback((): InitialDataPayload => {
    const stored = localStorage.getItem(SYNC_DATA_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {}
    }
    return { contents: [], categories: [], vacations: [] };
  }, []);

  return {
    isConnected,
    isConnecting,
    pendingEventsCount: pendingEvents.length,
    connect,
    disconnect,
    // Auth
    login,
    logout,
    requestData,
    // Sync
    syncContentCreate,
    syncContentUpdate,
    syncContentDelete,
    syncCategoryCreate,
    syncCategoryUpdate,
    syncCategoryDelete,
    syncVacationCreate,
    syncVacationDelete,
    // Cache
    saveToLocalCache,
    loadFromLocalCache,
  };
};
