import { useState, useCallback, useRef, useEffect } from 'react';
import { SyncEvent, SyncEventType, SyncState } from '@/types/sync';
import { Category, ContentItem, VacationPeriod } from '@/types/planner';

const SYNC_STORAGE_KEY = 'planner_sync_queue';
const SYNC_DATA_KEY = 'planner_data';

interface SyncData {
  contents: ContentItem[];
  categories: Category[];
  vacations: VacationPeriod[];
}

interface UseSyncOptions {
  userId: string | null;
  wsUrl?: string;
  onContentUpdate?: (contents: ContentItem[]) => void;
  onCategoryUpdate?: (categories: Category[]) => void;
  onVacationUpdate?: (vacations: VacationPeriod[]) => void;
}

export const useSync = ({
  userId,
  wsUrl,
  onContentUpdate,
  onCategoryUpdate,
  onVacationUpdate,
}: UseSyncOptions) => {
  const [syncState, setSyncState] = useState<SyncState>(() => {
    const stored = localStorage.getItem(SYNC_STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return { pendingEvents: [], lastSyncTimestamp: 0, isConnected: false };
      }
    }
    return { pendingEvents: [], lastSyncTimestamp: 0, isConnected: false };
  });

  const wsRef = useRef<WebSocket | null>(null);

  // Save pending events to localStorage
  useEffect(() => {
    localStorage.setItem(SYNC_STORAGE_KEY, JSON.stringify(syncState));
  }, [syncState]);

  // Save data to localStorage
  const saveDataToCache = useCallback((data: Partial<SyncData>) => {
    const stored = localStorage.getItem(SYNC_DATA_KEY);
    let currentData: SyncData = { contents: [], categories: [], vacations: [] };
    if (stored) {
      try {
        currentData = JSON.parse(stored);
      } catch {}
    }
    const newData = { ...currentData, ...data };
    localStorage.setItem(SYNC_DATA_KEY, JSON.stringify(newData));
  }, []);

  // Load data from cache
  const loadDataFromCache = useCallback((): SyncData => {
    const stored = localStorage.getItem(SYNC_DATA_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {}
    }
    return { contents: [], categories: [], vacations: [] };
  }, []);

  // Create a sync event
  const createEvent = useCallback(
    (type: SyncEventType, payload: ContentItem | Category | VacationPeriod | { id: string }): SyncEvent => ({
      id: crypto.randomUUID(),
      type,
      payload,
      timestamp: Date.now(),
      userId: userId || 'anonymous',
    }),
    [userId]
  );

  // Queue an event for sync
  const queueEvent = useCallback((event: SyncEvent) => {
    setSyncState((prev) => ({
      ...prev,
      pendingEvents: [...prev.pendingEvents, event],
    }));

    // If connected, send immediately
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(event));
    }
  }, []);

  // Content events
  const syncContentCreate = useCallback(
    (content: ContentItem) => {
      const event = createEvent('content:create', content);
      queueEvent(event);
    },
    [createEvent, queueEvent]
  );

  const syncContentUpdate = useCallback(
    (content: ContentItem) => {
      const event = createEvent('content:update', content);
      queueEvent(event);
    },
    [createEvent, queueEvent]
  );

  const syncContentDelete = useCallback(
    (contentId: string) => {
      const event = createEvent('content:delete', { id: contentId });
      queueEvent(event);
    },
    [createEvent, queueEvent]
  );

  // Category events
  const syncCategoryCreate = useCallback(
    (category: Category) => {
      const event = createEvent('category:create', category);
      queueEvent(event);
    },
    [createEvent, queueEvent]
  );

  const syncCategoryUpdate = useCallback(
    (category: Category) => {
      const event = createEvent('category:update', category);
      queueEvent(event);
    },
    [createEvent, queueEvent]
  );

  const syncCategoryDelete = useCallback(
    (categoryId: string) => {
      const event = createEvent('category:delete', { id: categoryId });
      queueEvent(event);
    },
    [createEvent, queueEvent]
  );

  // Vacation events
  const syncVacationCreate = useCallback(
    (vacation: VacationPeriod) => {
      const event = createEvent('vacation:create', vacation);
      queueEvent(event);
    },
    [createEvent, queueEvent]
  );

  const syncVacationDelete = useCallback(
    (vacationId: string) => {
      const event = createEvent('vacation:delete', { id: vacationId });
      queueEvent(event);
    },
    [createEvent, queueEvent]
  );

  // Handle incoming events from WebSocket
  const handleIncomingEvent = useCallback(
    (event: SyncEvent) => {
      // Skip own events
      if (event.userId === userId) return;

      const cachedData = loadDataFromCache();

      switch (event.type) {
        case 'content:create':
          const newContent = event.payload as ContentItem;
          cachedData.contents.push(newContent);
          saveDataToCache({ contents: cachedData.contents });
          onContentUpdate?.(cachedData.contents);
          break;

        case 'content:update':
          const updatedContent = event.payload as ContentItem;
          cachedData.contents = cachedData.contents.map((c) =>
            c.id === updatedContent.id ? updatedContent : c
          );
          saveDataToCache({ contents: cachedData.contents });
          onContentUpdate?.(cachedData.contents);
          break;

        case 'content:delete':
          const deleteContentId = (event.payload as { id: string }).id;
          cachedData.contents = cachedData.contents.filter((c) => c.id !== deleteContentId);
          saveDataToCache({ contents: cachedData.contents });
          onContentUpdate?.(cachedData.contents);
          break;

        case 'category:create':
          const newCategory = event.payload as Category;
          cachedData.categories.push(newCategory);
          saveDataToCache({ categories: cachedData.categories });
          onCategoryUpdate?.(cachedData.categories);
          break;

        case 'category:update':
          const updatedCategory = event.payload as Category;
          cachedData.categories = cachedData.categories.map((c) =>
            c.id === updatedCategory.id ? updatedCategory : c
          );
          saveDataToCache({ categories: cachedData.categories });
          onCategoryUpdate?.(cachedData.categories);
          break;

        case 'category:delete':
          const deleteCategoryId = (event.payload as { id: string }).id;
          cachedData.categories = cachedData.categories.filter((c) => c.id !== deleteCategoryId);
          saveDataToCache({ categories: cachedData.categories });
          onCategoryUpdate?.(cachedData.categories);
          break;

        case 'vacation:create':
          const newVacation = event.payload as VacationPeriod;
          cachedData.vacations.push(newVacation);
          saveDataToCache({ vacations: cachedData.vacations });
          onVacationUpdate?.(cachedData.vacations);
          break;

        case 'vacation:delete':
          const deleteVacationId = (event.payload as { id: string }).id;
          cachedData.vacations = cachedData.vacations.filter((v) => v.id !== deleteVacationId);
          saveDataToCache({ vacations: cachedData.vacations });
          onVacationUpdate?.(cachedData.vacations);
          break;
      }
    },
    [userId, loadDataFromCache, saveDataToCache, onContentUpdate, onCategoryUpdate, onVacationUpdate]
  );

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (!wsUrl) return;

    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      console.log('WebSocket connected');
      setSyncState((prev) => ({ ...prev, isConnected: true }));

      // Send pending events
      syncState.pendingEvents.forEach((event) => {
        wsRef.current?.send(JSON.stringify(event));
      });
    };

    wsRef.current.onmessage = (message) => {
      try {
        const event: SyncEvent = JSON.parse(message.data);
        handleIncomingEvent(event);

        // Remove from pending if it was our event
        setSyncState((prev) => ({
          ...prev,
          pendingEvents: prev.pendingEvents.filter((e) => e.id !== event.id),
          lastSyncTimestamp: Date.now(),
        }));
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    wsRef.current.onclose = () => {
      console.log('WebSocket disconnected');
      setSyncState((prev) => ({ ...prev, isConnected: false }));
    };

    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }, [wsUrl, syncState.pendingEvents, handleIncomingEvent]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    wsRef.current?.close();
    wsRef.current = null;
  }, []);

  return {
    isConnected: syncState.isConnected,
    pendingEvents: syncState.pendingEvents,
    connect,
    disconnect,
    saveDataToCache,
    loadDataFromCache,
    // Content sync
    syncContentCreate,
    syncContentUpdate,
    syncContentDelete,
    // Category sync
    syncCategoryCreate,
    syncCategoryUpdate,
    syncCategoryDelete,
    // Vacation sync
    syncVacationCreate,
    syncVacationDelete,
  };
};
