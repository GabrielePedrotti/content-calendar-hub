import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { PlannerHeader } from "@/components/planner/PlannerHeader";
import { CompactWeekGrid } from "@/components/planner/CompactWeekGrid";
import { MonthSeparator } from "@/components/planner/MonthSeparator";
import { ContentDialog } from "@/components/planner/ContentDialog";
import { CategoryManager } from "@/components/planner/CategoryManager";
// SeriesCreator removed - functionality merged into SeriesManager
import { PlannerFilters } from "@/components/planner/PlannerFilters";
import { InfoDialog } from "@/components/planner/InfoDialog";
import { VacationManager } from "@/components/planner/VacationManager";
import { TaskView } from "@/components/planner/TaskView";
import { TaskListView } from "@/components/planner/TaskListView";
import { TemplateManager } from "@/components/planner/TemplateManager";
import { SeriesManager } from "@/components/planner/SeriesManager";
// ShortsPresetManager removed - functionality merged into SeriesManager
import { LoginDialog } from "@/components/auth/LoginDialog";
import { WebSocketSettings, getStoredWsUrl } from "@/components/settings/WebSocketSettings";
import { Category, CategoryFeatures, DEFAULT_CATEGORY_FEATURES, ContentItem, WeekDay, VacationPeriod, ContentTemplate, Series } from "@/types/planner";
import { User } from "@/types/auth";
import { InitialDataPayload } from "@/types/sync";
import { Button } from "@/components/ui/button";
import { Info, Calendar, ListTodo, List, LogOut, Wifi, WifiOff, Loader2, Undo2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useUndoStack } from "@/hooks/useUndoStack";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  startOfMonth,
  endOfMonth,
  eachWeekOfInterval,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addMonths,
  subMonths,
  isSunday,
  addDays,
  isWeekend,
  addWeeks,
  format,
  isSameMonth,
  getMonth,
  getYear,
  isToday,
  isSameWeek,
} from "date-fns";
import { it } from "date-fns/locale";

// Helper per parsare le date dalle stringhe JSON
const parseContentDate = (content: any): ContentItem => ({
  ...content,
  date: new Date(content.date),
});

const parseVacationDates = (vacation: any): VacationPeriod => ({
  ...vacation,
  startDate: new Date(vacation.startDate),
  endDate: new Date(vacation.endDate),
});

// WebSocket URL
const WS_URL = "wss://planner.hemerald.net/wss/";

const Index = () => {
  // WebSocket URL: env var takes priority, then localStorage
  const [wsUrl, setWsUrl] = useState<string | null>(() => WS_URL || getStoredWsUrl());
  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<ContentItem | undefined>();
  const [preselectedCategory, setPreselectedCategory] = useState<string | undefined>();
  const [preselectedDate, setPreselectedDate] = useState<Date | undefined>();
  const [preselectedTemplateId, setPreselectedTemplateId] = useState<string | undefined>();
  const [viewMode, setViewMode] = useState<"planner" | "task" | "tasklist">("planner");
  const [cellOpacity, setCellOpacity] = useState({ empty: 8, filled: 35 });
  const [endlessMode, setEndlessMode] = useState(false);
  const [endlessWeeksBefore, setEndlessWeeksBefore] = useState(0);
  const [monthsToShow, setMonthsToShow] = useState(3);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Filtri
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Drag & Drop
  const [draggedContent, setDraggedContent] = useState<ContentItem | null>(null);
  const [isAltDrag, setIsAltDrag] = useState(false);

  // Link highlighting
  const [highlightedContentId, setHighlightedContentId] = useState<string | null>(null);

  // Generate dynamic IDs for default categories (will be replaced by server data)
  const [categories, setCategories] = useState<Category[]>(() => [
    { id: `cat-${Date.now()}-1`, name: "CHRONICLES", color: "142 76% 45%" },
    { id: `cat-${Date.now()}-2`, name: "GAMING", color: "210 100% 50%" },
    { id: `cat-${Date.now()}-3`, name: "MINECRAFT", color: "0 70% 45%" },
    { id: `cat-${Date.now()}-4`, name: "REC", color: "270 60% 55%" },
    { id: `cat-${Date.now()}-5`, name: "VOD", color: "25 95% 53%" },
    { id: `cat-${Date.now()}-6`, name: "TWITCH", color: "270 50% 70%" },
  ]);

  const [contents, setContents] = useState<ContentItem[]>([]);
  const [vacations, setVacations] = useState<VacationPeriod[]>([]);

  // Templates, Series
  const [templates, setTemplates] = useState<ContentTemplate[]>([]);
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  
  // Track if "2" key is pressed for secondary template
  const [isSecondaryTemplateMode, setIsSecondaryTemplateMode] = useState(false);

  // Undo Stack interface (implementation after useWebSocket)
  interface UndoState {
    contents: ContentItem[];
    categories: Category[];
    vacations: VacationPeriod[];
  }

  // WebSocket callbacks
  const handleAuthSuccess = useCallback((wsUser: User, token: string) => {
    setUser(wsUser);
    setAuthError(null);
    setIsAuthenticating(false);
    toast.success("Login effettuato");
  }, []);

  const handleAuthError = useCallback((error: string) => {
    setAuthError(error);
    setIsAuthenticating(false);
  }, []);

  const handleInitialData = useCallback((data: InitialDataPayload) => {
    if (data.contents) setContents(data.contents.map(parseContentDate));
    if (data.categories && data.categories.length > 0) setCategories(data.categories);
    if (data.vacations) setVacations(data.vacations.map(parseVacationDates));
    toast.success("Dati sincronizzati");
  }, []);

  const handleContentChange = useCallback((type: 'created' | 'updated' | 'deleted', payload: ContentItem | { id: string }) => {
    if (type === 'created') {
      setContents(prev => [...prev, parseContentDate(payload)]);
    } else if (type === 'updated') {
      const parsed = parseContentDate(payload);
      setContents(prev => prev.map(c => c.id === parsed.id ? parsed : c));
    } else if (type === 'deleted') {
      setContents(prev => prev.filter(c => c.id !== (payload as { id: string }).id));
    }
  }, []);

  const handleCategoryChange = useCallback((type: 'created' | 'updated' | 'deleted', payload: Category | { id: string }) => {
    if (type === 'created') {
      setCategories(prev => [...prev, payload as Category]);
    } else if (type === 'updated') {
      setCategories(prev => prev.map(c => c.id === (payload as Category).id ? payload as Category : c));
    } else if (type === 'deleted') {
      setCategories(prev => prev.filter(c => c.id !== (payload as { id: string }).id));
    }
  }, []);

  const handleVacationChange = useCallback((type: 'created' | 'deleted', payload: VacationPeriod | { id: string }) => {
    if (type === 'created') {
      setVacations(prev => [...prev, parseVacationDates(payload)]);
    } else if (type === 'deleted') {
      setVacations(prev => prev.filter(v => v.id !== (payload as { id: string }).id));
    }
  }, []);

  const handleWsError = useCallback((error: string) => {
    toast.error(error);
  }, []);

  // WebSocket hook
  const {
    isConnected,
    isConnecting,
    pendingEventsCount,
    login: wsLogin,
    logout: wsLogout,
    requestData,
    syncContentCreate,
    syncContentUpdate,
    syncContentDelete,
    syncCategoryCreate,
    syncCategoryUpdate,
    syncCategoryDelete,
    syncVacationCreate,
    syncVacationDelete,
    saveToLocalCache,
    loadFromLocalCache,
  } = useWebSocket({
    wsUrl,
    onAuthSuccess: handleAuthSuccess,
    onAuthError: handleAuthError,
    onInitialData: handleInitialData,
    onContentChange: handleContentChange,
    onCategoryChange: handleCategoryChange,
    onVacationChange: handleVacationChange,
    onError: handleWsError,
  });

  // Undo Stack implementation (after useWebSocket so sync functions exist)
  const syncUndoDiff = useCallback((from: UndoState, to: UndoState) => {
    const contentKey = (c: ContentItem) =>
      JSON.stringify({ ...c, date: c.date instanceof Date ? c.date.toISOString() : c.date });
    const categoryKey = (c: Category) => JSON.stringify(c);
    const vacationKey = (v: VacationPeriod) =>
      JSON.stringify({
        ...v,
        startDate: v.startDate instanceof Date ? v.startDate.toISOString() : v.startDate,
        endDate: v.endDate instanceof Date ? v.endDate.toISOString() : v.endDate,
      });

    // --- Contents ---
    const fromContents = new Map(from.contents.map((c) => [c.id, c] as const));
    const toContents = new Map(to.contents.map((c) => [c.id, c] as const));

    fromContents.forEach((c, id) => {
      if (!toContents.has(id)) syncContentDelete(id);
    });
    toContents.forEach((c, id) => {
      const prev = fromContents.get(id);
      if (!prev) syncContentCreate(c);
      else if (contentKey(prev) !== contentKey(c)) syncContentUpdate(c);
    });

    // --- Categories ---
    const fromCats = new Map(from.categories.map((c) => [c.id, c] as const));
    const toCats = new Map(to.categories.map((c) => [c.id, c] as const));

    fromCats.forEach((_c, id) => {
      if (!toCats.has(id)) syncCategoryDelete(id);
    });
    toCats.forEach((c, id) => {
      const prev = fromCats.get(id);
      if (!prev) syncCategoryCreate(c);
      else if (categoryKey(prev) !== categoryKey(c)) syncCategoryUpdate(c);
    });

    // --- Vacations (only create/delete supported) ---
    const fromVac = new Map(from.vacations.map((v) => [v.id, v] as const));
    const toVac = new Map(to.vacations.map((v) => [v.id, v] as const));

    fromVac.forEach((_v, id) => {
      if (!toVac.has(id)) syncVacationDelete(id);
    });
    toVac.forEach((v, id) => {
      const prev = fromVac.get(id);
      if (!prev) syncVacationCreate(v);
      else if (vacationKey(prev) !== vacationKey(v)) {
        // no vacation:update endpoint -> recreate
        syncVacationDelete(id);
        syncVacationCreate(v);
      }
    });
  }, [
    syncContentCreate,
    syncContentUpdate,
    syncContentDelete,
    syncCategoryCreate,
    syncCategoryUpdate,
    syncCategoryDelete,
    syncVacationCreate,
    syncVacationDelete,
  ]);

  const { pushUndo, undo, canUndo } = useUndoStack<UndoState>({
    getCurrentState: useCallback(
      () => ({
        contents,
        categories,
        vacations,
      }),
      [contents, categories, vacations]
    ),
    onBeforeRestore: syncUndoDiff,
    restoreState: useCallback((state: UndoState) => {
      setContents(state.contents);
      setCategories(state.categories);
      setVacations(state.vacations);
      toast.success("Azione annullata");
    }, []),
  });

  // Login handler
  const handleLogin = useCallback((email: string, password: string) => {
    setIsAuthenticating(true);
    setAuthError(null);
    
    if (wsUrl) {
      // Login via WebSocket
      wsLogin(email, password);
    } else {
      // Fallback: login locale (demo mode)
      setTimeout(() => {
        setUser({
          id: crypto.randomUUID(),
          email,
          name: email.split('@')[0],
        });
        setIsAuthenticating(false);
        toast.success("Login effettuato (modalità offline)");
      }, 500);
    }
  }, [wsLogin]);

  // Logout handler
  const handleLogout = useCallback(() => {
    if (wsUrl) {
      wsLogout();
    }
    setUser(null);
    toast.success("Logout effettuato");
  }, [wsLogout]);

  // Richiedi dati appena la connessione WebSocket è stabilita
  useEffect(() => {
    if (isConnected) {
      requestData();
    }
  }, [isConnected, requestData]);

  // Load cached data on mount (fallback offline)
  useEffect(() => {
    const cachedData = loadFromLocalCache();
    if (cachedData.contents.length > 0) setContents(cachedData.contents.map(parseContentDate));
    if (cachedData.categories.length > 0) setCategories(cachedData.categories);
    if (cachedData.vacations.length > 0) setVacations(cachedData.vacations.map(parseVacationDates));
  }, [loadFromLocalCache]);

  // Track if "1" key is pressed for primary template mode (force popup open)
  const [isPrimaryTemplateMode, setIsPrimaryTemplateMode] = useState(false);

  // Keyboard shortcuts for "N" (new content), "1" (primary template mode), and "2" (secondary template mode)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      // "N" opens new content dialog
      if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        handleAddContent();
      }
      
      // "1" enables primary template mode (opens popup on cell click)
      if (e.key === "1") {
        setIsPrimaryTemplateMode(true);
      }
      
      // "2" enables secondary template mode
      if (e.key === "2") {
        setIsSecondaryTemplateMode(true);
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "1") {
        setIsPrimaryTemplateMode(false);
      }
      if (e.key === "2") {
        setIsSecondaryTemplateMode(false);
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Save data to cache when it changes
  useEffect(() => {
    saveToLocalCache({ contents, categories, vacations });
  }, [contents, categories, vacations, saveToLocalCache]);

  const weeks = useMemo(() => {
    if (endlessMode) {
      // In modalità endless, genera settimane per più mesi (incluse settimane passate)
      const allWeeks: { weekNumber: number; days: WeekDay[]; monthYear: string; monthLabelDate: Date }[] = [];
      let weekCounter = 1;

      // Use endlessWeeksBefore directly as the number of weeks to go back (not months)
      const weeksBackMonths = endlessWeeksBefore > 0 ? Math.max(1, Math.floor(endlessWeeksBefore / 4)) : 0;

      for (let i = -weeksBackMonths; i < monthsToShow; i++) {
        const targetDate = addMonths(currentDate, i);
        const monthStart = startOfMonth(targetDate);
        const monthEnd = endOfMonth(targetDate);

        const weeksInMonth = eachWeekOfInterval(
          {
            start: monthStart,
            end: monthEnd,
          },
          { locale: it, weekStartsOn: 1 }
        );

        weeksInMonth.forEach((weekStart) => {
          const weekEnd = endOfWeek(weekStart, { locale: it, weekStartsOn: 1 });
          const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

          const weekDays: WeekDay[] = days.map((day) => ({
            date: day,
            dayName: day.toLocaleDateString("it-IT", { weekday: "long" }),
            dayNumber: day.getDate(),
            isSunday: isSunday(day),
          }));

          const daysInTargetMonth = days.filter(
            (d) => d.getMonth() === targetDate.getMonth() && d.getFullYear() === targetDate.getFullYear()
          );

          // Mostra tutte le settimane, anche quelle a cavallo tra due mesi
          const labelDate = daysInTargetMonth[Math.floor(daysInTargetMonth.length / 2)] ?? targetDate;
          allWeeks.push({
            weekNumber: weekCounter++,
            days: weekDays,
            monthYear: `${targetDate.getMonth()}-${targetDate.getFullYear()}`,
            monthLabelDate: labelDate,
          });
        });
      }

      return allWeeks;
    } else {
      // Modalità normale - solo il mese corrente
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);

      const weeksInMonth = eachWeekOfInterval(
        {
          start: monthStart,
          end: monthEnd,
        },
        { locale: it, weekStartsOn: 1 }
      );

      return weeksInMonth.map((weekStart, index) => {
        const weekEnd = endOfWeek(weekStart, { locale: it, weekStartsOn: 1 });
        const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

        const weekDays: WeekDay[] = days.map((day) => ({
          date: day,
          dayName: day.toLocaleDateString("it-IT", { weekday: "long" }),
          dayNumber: day.getDate(),
          isSunday: isSunday(day),
        }));

        return {
          weekNumber: index + 1,
          days: weekDays,
          monthYear: `${monthStart.getMonth()}-${monthStart.getFullYear()}`,
          monthLabelDate: monthStart,
        };
      });
    }
  }, [currentDate, endlessMode, monthsToShow, endlessWeeksBefore]);

  // Filtro settimane e categorie
  const filteredWeeks = useMemo(() => {
    return weeks.filter((week) => selectedWeek === null || week.weekNumber === selectedWeek);
  }, [weeks, selectedWeek]);

  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => selectedCategory === null || cat.id === selectedCategory);
  }, [categories, selectedCategory]);

  // Filtered contents based on search query
  const filteredContents = useMemo(() => {
    if (!searchQuery.trim()) return contents;
    const query = searchQuery.toLowerCase();
    return contents.filter((c) => 
      c.title.toLowerCase().includes(query) ||
      c.notes?.toLowerCase().includes(query)
    );
  }, [contents, searchQuery]);

  // Scroll infinito - carica più settimane quando si scrolla in basso
  useEffect(() => {
    if (!endlessMode) return;

    const handleScroll = () => {
      const container = scrollContainerRef.current;
      if (!container) return;

      const { scrollTop, scrollHeight, clientHeight } = container;
      const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

      // Quando si è scrollato all'80%, carica altre settimane
      if (scrollPercentage > 0.8) {
        setMonthsToShow((prev) => prev + 2);
      }
    };

    const container = scrollContainerRef.current;
    container?.addEventListener("scroll", handleScroll);

    return () => {
      container?.removeEventListener("scroll", handleScroll);
    };
  }, [endlessMode]);

  const handlePreviousMonth = () => {
    if (!endlessMode) {
      setCurrentDate(subMonths(currentDate, 1));
    }
  };

  const handleNextMonth = () => {
    if (!endlessMode) {
      setCurrentDate(addMonths(currentDate, 1));
    }
  };

  const handleEndlessModeToggle = (enabled: boolean) => {
    setEndlessMode(enabled);
    if (enabled) {
      setMonthsToShow(3);
    }
  };

  // Auto-scroll to current week on mount
  useEffect(() => {
    const scrollToCurrentWeek = () => {
      const container = scrollContainerRef.current;
      if (!container) return;

      // Find the current week element
      const todayWeek = weeks.find((week) =>
        week.days.some((day) => isToday(day.date))
      );
      if (!todayWeek) return;

      // Get all week elements
      const weekElements = container.querySelectorAll('[data-week-number]');
      const currentWeekElement = container.querySelector(`[data-week-number="${todayWeek.weekNumber}"]`);
      
      if (currentWeekElement) {
        const containerHeight = container.clientHeight;
        const elementTop = (currentWeekElement as HTMLElement).offsetTop;
        // Scroll so that current week is roughly in the center (second position)
        const scrollPosition = elementTop - containerHeight / 4;
        container.scrollTo({ top: Math.max(0, scrollPosition), behavior: 'auto' });
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(scrollToCurrentWeek, 100);
    return () => clearTimeout(timer);
  }, [weeks]);

  const handleAddContent = () => {
    setEditingContent(undefined);
    setPreselectedCategory(undefined);
    setPreselectedDate(undefined);
    setPreselectedTemplateId(undefined);
    setDialogOpen(true);
  };

  const handleEditContent = (
    content?: ContentItem,
    categoryId?: string,
    date?: Date,
    templateId?: string
  ) => {
    setEditingContent(content);
    setPreselectedCategory(categoryId);
    setPreselectedDate(date);
    setPreselectedTemplateId(templateId);
    setDialogOpen(true);
  };

  const handleSaveContent = (
    content: Omit<ContentItem, "id"> & { id?: string },
    linkedShortTemplateId?: string
  ) => {
    pushUndo("save_content");
    if (content.id) {
      // If updating content with a linkedContentId, create bidirectional link
      const oldContent = contents.find((c) => c.id === content.id);
      const isAddingLink = content.linkedContentId && oldContent?.linkedContentId !== content.linkedContentId;
      const isRemovingLink = !content.linkedContentId && oldContent?.linkedContentId;

      const updatedContent = { ...content, id: content.id } as ContentItem;
      
      setContents((prev) => {
        let updated = prev.map((c) => (c.id === content.id ? updatedContent : c));
        
        // Remove old bidirectional link if changing
        if (oldContent?.linkedContentId && oldContent.linkedContentId !== content.linkedContentId) {
          updated = updated.map((c) =>
            c.id === oldContent.linkedContentId && c.linkedContentId === content.id
              ? { ...c, linkedContentId: undefined }
              : c
          );
        }
        
        // Add new bidirectional link
        if (isAddingLink) {
          updated = updated.map((c) =>
            c.id === content.linkedContentId ? { ...c, linkedContentId: content.id } : c
          );
        }
        
        // Remove bidirectional link
        if (isRemovingLink && oldContent.linkedContentId) {
          updated = updated.map((c) =>
            c.id === oldContent.linkedContentId && c.linkedContentId === content.id
              ? { ...c, linkedContentId: undefined }
              : c
          );
        }
        
        return updated;
      });
      
      syncContentUpdate(updatedContent);
      toast.success("Contenuto aggiornato");
    } else {
      const newContent: ContentItem = {
        ...content,
        id: Date.now().toString(),
      };
      
      // If creating with a linkedContentId, create bidirectional link
      if (newContent.linkedContentId) {
        setContents((prev) => {
          const updated = [...prev, newContent];
          return updated.map((c) =>
            c.id === newContent.linkedContentId ? { ...c, linkedContentId: newContent.id } : c
          );
        });
      } else {
        setContents((prev) => [...prev, newContent]);
      }
      syncContentCreate(newContent);
      toast.success("Contenuto creato");
      
      
      // Generate shorts from linked template (for video type with linked short template)
      if (linkedShortTemplateId && content.contentType === "video") {
        const shortTemplate = templates.find((t) => t.id === linkedShortTemplateId);
        // Find the video template to get shorts settings
        const videoTemplate = content.templateId 
          ? templates.find((t) => t.id === content.templateId)
          : null;
        
        if (shortTemplate) {
          const shortsCount = videoTemplate?.shortsCount || 1;
          const shortsDayOffset = videoTemplate?.shortsDayOffset || 1;
          
          for (let i = 0; i < shortsCount; i++) {
            const shortContent: ContentItem = {
              id: `short-${Date.now()}-${i}`,
              title: shortTemplate.titlePrefix 
                ? `${shortTemplate.titlePrefix}${newContent.title}${shortTemplate.titleSuffix || ""}`
                : shortsCount > 1 
                  ? `${newContent.title} - Short ${i + 1}`
                  : newContent.title,
              categoryId: shortTemplate.defaultCategoryId || newContent.categoryId,
              date: addDays(newContent.date, shortsDayOffset + i), // Offset + sequential days
              published: false,
              contentType: "short",
              parentId: newContent.id,
              templateId: shortTemplate.id,
              pipelineStageId: shortTemplate.defaultPipeline[0]?.id,
              checklist: shortTemplate.defaultChecklist.map((item, idx) => ({
                id: `check-${Date.now()}-${i}-${idx}`,
                label: item.label,
                isDone: false,
                order: item.order,
              })),
            };
            
            setContents((prev) => [...prev, shortContent]);
            syncContentCreate(shortContent);
          }
          
          if (shortsCount > 1) {
            toast.success(`${shortsCount} shorts creati automaticamente`);
          } else {
            toast.success("Short creato automaticamente dal template");
          }
        }
      }
    }
  };

  const handleDeleteContent = (id: string) => {
    pushUndo("delete_content");
    setContents((prev) => prev.filter((c) => c.id !== id));
    syncContentDelete(id);
    toast.success("Contenuto eliminato");
  };

  // Gestione categorie
  const handleAddCategory = (name: string, color: string, features?: CategoryFeatures, defaultTemplateId?: string, secondaryTemplateId?: string) => {
    pushUndo("add_category");
    const newCategory: Category = {
      id: Date.now().toString(),
      name,
      color,
      features: features || { ...DEFAULT_CATEGORY_FEATURES },
      defaultTemplateId,
      secondaryTemplateId,
    };
    setCategories((prev) => [...prev, newCategory]);
    syncCategoryCreate(newCategory);
    toast.success(`Categoria "${name}" aggiunta`);
  };

  const handleUpdateCategory = (id: string, name: string, color: string, features?: CategoryFeatures, defaultTemplateId?: string, secondaryTemplateId?: string) => {
    pushUndo("update_category");
    const updatedCategory: Category = { id, name, color, features, defaultTemplateId, secondaryTemplateId };
    setCategories((prev) =>
      prev.map((cat) => (cat.id === id ? updatedCategory : cat))
    );
    syncCategoryUpdate(updatedCategory);
    toast.success(`Categoria aggiornata`);
  };

  const handleDeleteCategory = (id: string) => {
    pushUndo("delete_category");
    setCategories((prev) => prev.filter((cat) => cat.id !== id));
    setContents((prev) => prev.filter((c) => c.categoryId !== id));
    syncCategoryDelete(id);
    toast.success("Categoria eliminata");
  };

  // Riordinamento categorie
  const handleReorderCategories = (newCategories: Category[]) => {
    pushUndo("reorder_categories");
    setCategories(newCategories);
  };

  // Template handlers
  const handleAddTemplate = (template: ContentTemplate) => {
    setTemplates((prev) => [...prev, template]);
    toast.success(`Template "${template.name}" creato`);
  };

  const handleUpdateTemplate = (template: ContentTemplate) => {
    setTemplates((prev) => prev.map((t) => (t.id === template.id ? template : t)));
    toast.success("Template aggiornato");
  };

  const handleDeleteTemplate = (id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    toast.success("Template eliminato");
  };

  // Series handlers
  const handleAddSeries = (series: Series) => {
    setSeriesList((prev) => [...prev, series]);
    toast.success(`Serie "${series.name}" creata`);
  };

  const handleUpdateSeries = (series: Series) => {
    setSeriesList((prev) => prev.map((s) => (s.id === series.id ? series : s)));
    toast.success("Serie aggiornata");
  };

  const handleDeleteSeries = (id: string) => {
    setSeriesList((prev) => prev.filter((s) => s.id !== id));
    toast.success("Serie eliminata");
  };

  const handleGenerateSeriesOccurrences = (seriesId: string) => {
    const series = seriesList.find((s) => s.id === seriesId);
    if (!series) return;
    const template = templates.find((t) => t.id === series.templateId);
    
    // Generate next occurrence
    const title = (series.options.titlePattern || "{series_name} Ep. {n}")
      .replace("{series_name}", series.name)
      .replace("{n}", series.currentNumber.toString());
    
    const newContent: ContentItem = {
      id: `series-${Date.now()}`,
      title,
      categoryId: template?.defaultCategoryId || categories[0]?.id || "",
      date: series.startDate,
      published: false,
      seriesId: series.id,
      templateId: template?.id,
      contentType: template?.contentType,
      pipelineStageId: template?.defaultPipeline[0]?.id,
      checklist: template?.defaultChecklist.map((item, idx) => ({
        id: `check-${Date.now()}-${idx}`,
        label: item.label,
        isDone: false,
        order: item.order,
      })),
    };
    
    setContents((prev) => [...prev, newContent]);
    setSeriesList((prev) => 
      prev.map((s) => s.id === seriesId ? { ...s, currentNumber: s.currentNumber + 1 } : s)
    );
    syncContentCreate(newContent);
    toast.success(`Generato: ${title}`);
  };


  // Drag & Drop with ALT support
  const handleDragStart = (content: ContentItem, altPressed: boolean) => {
    setDraggedContent(content);
    setIsAltDrag(altPressed);
  };

  const handleDragOver = (categoryId: string, date: Date) => {
    // Necessario per permettere il drop
  };

  const handleDrop = (categoryId: string, date: Date) => {
    if (!draggedContent) return;

    pushUndo("drag_drop");
    if (isAltDrag) {
      // ALT + Drag = Duplica
      const duplicated: ContentItem = {
        ...draggedContent,
        id: Date.now().toString(),
        categoryId,
        date,
      };
      setContents((prev) => [...prev, duplicated]);
      syncContentCreate(duplicated);
      toast.success("Contenuto duplicato");
    } else {
      // Drag normale = Sposta
      const movedContent: ContentItem = { ...draggedContent, categoryId, date };
      setContents((prev) =>
        prev.map((c) =>
          c.id === draggedContent.id ? movedContent : c
        )
      );
      syncContentUpdate(movedContent);
      toast.success("Contenuto spostato");
    }
    
    setDraggedContent(null);
    setIsAltDrag(false);
  };

  // Duplicazione
  const handleDuplicate = (content: ContentItem, newDate: Date) => {
    pushUndo("duplicate_content");
    const duplicated: ContentItem = {
      ...content,
      id: Date.now().toString(),
      date: newDate,
    };
    setContents((prev) => [...prev, duplicated]);
    syncContentCreate(duplicated);
    toast.success("Contenuto duplicato");
  };

  // Toggle pubblicato
  const handleTogglePublished = (content: ContentItem) => {
    pushUndo("toggle_published");
    const updatedContent: ContentItem = { ...content, published: !content.published };
    setContents((prev) => prev.map((c) => (c.id === content.id ? updatedContent : c)));
    syncContentUpdate(updatedContent);
    toast.success(content.published ? "Segnato come non pubblicato" : "Segnato come pubblicato");
  };

  // Vacations management
  const handleAddVacation = (startDate: Date, endDate: Date, label: string) => {
    pushUndo("add_vacation");
    const newVacation: VacationPeriod = {
      id: Date.now().toString(),
      startDate,
      endDate,
      label,
    };
    setVacations((prev) => [...prev, newVacation]);
    syncVacationCreate(newVacation);
    toast.success(`Periodo "${label}" aggiunto`);
  };

  const handleUpdateVacation = (vacation: VacationPeriod) => {
    pushUndo("update_vacation");
    setVacations((prev) => prev.map((v) => (v.id === vacation.id ? vacation : v)));
    // Since there's no vacation:update, we recreate it
    syncVacationDelete(vacation.id);
    syncVacationCreate(vacation);
    toast.success("Periodo aggiornato");
  };

  const handleDeleteVacation = (id: string) => {
    pushUndo("delete_vacation");
    setVacations((prev) => prev.filter((v) => v.id !== id));
    syncVacationDelete(id);
    toast.success("Periodo eliminato");
  };

  // Link highlighting
  const handleLinkHover = (contentId: string | null) => {
    setHighlightedContentId(contentId);
  };

  const handleLinkClick = (content: ContentItem) => {
    if (!content.linkedContentId) return;
    
    const linkedContent = contents.find((c) => c.id === content.linkedContentId);
    if (!linkedContent) {
      toast.error("Contenuto collegato non trovato");
      return;
    }

    // Highlight temporaneo
    setHighlightedContentId(content.linkedContentId);
    setTimeout(() => setHighlightedContentId(null), 2000);

    // Scroll to content (if visible)
    const linkedElement = document.querySelector(`[data-content-id="${content.linkedContentId}"]`);
    if (linkedElement) {
      linkedElement.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      toast.info(
        `Contenuto collegato: ${format(linkedContent.date, "d MMM", { locale: it })} - ${
          categories.find((cat) => cat.id === linkedContent.categoryId)?.name
        }`
      );
    }
  };

  // Task view scroll
  const handleScrollToContent = (content: ContentItem) => {
    setViewMode("planner");
    setTimeout(() => {
      const element = document.querySelector(`[data-content-id="${content.id}"]`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 100);
  };
  const handleQuickEdit = (
    content: ContentItem | undefined,
    categoryId: string,
    date: Date,
    newTitle: string
  ) => {
    pushUndo("quick_edit");

    // If title is empty, delete the content
    if (!newTitle.trim()) {
      if (content) {
        setContents((prev) => prev.filter((c) => c.id !== content.id));
        syncContentDelete(content.id);
        toast.success("Contenuto eliminato");
      }
      return;
    }

    if (content) {
      // Update existing content
      const updatedContent: ContentItem = { ...content, title: newTitle };
      setContents((prev) => prev.map((c) => (c.id === content.id ? updatedContent : c)));
      syncContentUpdate(updatedContent);
      toast.success("Contenuto aggiornato");
    } else {
      // Create new content
      const newContent: ContentItem = {
        id: Date.now().toString(),
        title: newTitle,
        categoryId,
        date,
        published: false,
      };
      setContents((prev) => [...prev, newContent]);
      syncContentCreate(newContent);
      toast.success("Contenuto creato");
    }
  };

  return (
    <>
      <LoginDialog 
        open={!user} 
        onLogin={handleLogin} 
        isLoading={isAuthenticating}
        error={authError}
      />
      
      <div className="h-screen bg-background text-foreground flex flex-col overflow-hidden">
        <PlannerHeader
          currentDate={currentDate}
          onPreviousMonth={handlePreviousMonth}
          onNextMonth={handleNextMonth}
          onAddContent={handleAddContent}
          cellOpacity={cellOpacity}
          onOpacityChange={setCellOpacity}
          endlessMode={endlessMode}
          onEndlessModeChange={handleEndlessModeToggle}
          endlessWeeksBefore={endlessWeeksBefore}
          onEndlessWeeksBeforeChange={setEndlessWeeksBefore}
          isConnecting={isConnecting}
          isConnected={isConnected}
          pendingEventsCount={pendingEventsCount}
          
          onInfoClick={() => setInfoDialogOpen(true)}
          user={user}
          onLogout={handleLogout}
          managementButtons={
            <>
              <CategoryManager
                categories={categories}
                templates={templates}
                onAddCategory={handleAddCategory}
                onUpdateCategory={handleUpdateCategory}
                onDeleteCategory={handleDeleteCategory}
                onReorderCategories={handleReorderCategories}
              />
              <TemplateManager
                templates={templates}
                categories={categories}
                onAddTemplate={handleAddTemplate}
                onUpdateTemplate={handleUpdateTemplate}
                onDeleteTemplate={handleDeleteTemplate}
              />
              <SeriesManager
                series={seriesList}
                templates={templates}
                categories={categories}
                onAddSeries={handleAddSeries}
                onUpdateSeries={handleUpdateSeries}
                onDeleteSeries={handleDeleteSeries}
                onGenerateOccurrences={handleGenerateSeriesOccurrences}
              />
              <VacationManager
                vacations={vacations}
                onAddVacation={handleAddVacation}
                onDeleteVacation={handleDeleteVacation}
              />
            </>
          }
        />

      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "planner" | "task" | "tasklist")} className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center border-b border-grid-border bg-background sticky top-0 z-10">
          <TabsList className="justify-start rounded-none h-auto p-0 bg-transparent border-0">
            <TabsTrigger value="planner" className="gap-2 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
              <Calendar className="h-4 w-4" />
              Planner
            </TabsTrigger>
            <TabsTrigger value="task" className="gap-2 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
              <ListTodo className="h-4 w-4" />
              Oggi
            </TabsTrigger>
            <TabsTrigger value="tasklist" className="gap-2 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
              <List className="h-4 w-4" />
              Task List
            </TabsTrigger>
          </TabsList>
          
          {viewMode === "planner" && (
            <PlannerFilters
              categories={categories}
              contents={contents}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              selectedWeek={selectedWeek}
              onWeekChange={setSelectedWeek}
              totalWeeks={weeks.length}
              endlessMode={endlessMode}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onContentClick={(content) => {
                handleEditContent(content);
              }}
            />
          )}
        </div>

        <TabsContent value="planner" className="m-0 flex-1 overflow-hidden">

          <main 
            ref={scrollContainerRef}
            className="p-6 flex-1 overflow-y-auto h-full"
          >
            {endlessMode ? (
              // Modalità Endless - con separatori di mese
              (() => {
                let currentMonth = "";
                return filteredWeeks.map((week) => {
                  const weekMonth = week.monthYear;
                  const showSeparator = currentMonth !== weekMonth;
                  currentMonth = weekMonth;
                  
                  return (
                    <div key={week.weekNumber}>
                      {showSeparator && <MonthSeparator date={week.monthLabelDate} />}
                      <CompactWeekGrid
                        weekNumber={week.weekNumber}
                        weekDays={week.days}
                        categories={filteredCategories}
                        contents={filteredContents}
                        vacations={vacations}
                        onEditContent={handleEditContent}
                        onSaveContent={handleSaveContent}
                        onDragStart={handleDragStart}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        onDuplicate={handleDuplicate}
                        onTogglePublished={handleTogglePublished}
                        onQuickEdit={handleQuickEdit}
                        onLinkHover={handleLinkHover}
                        onLinkClick={handleLinkClick}
                        onDeleteContent={handleDeleteContent}
                        onUpdateVacation={handleUpdateVacation}
                        onDeleteVacation={handleDeleteVacation}
                        highlightedContentId={highlightedContentId}
                        cellOpacity={cellOpacity}
                        endlessMode={endlessMode}
                        monthLabelDate={week.monthLabelDate}
                        isPrimaryTemplateMode={isPrimaryTemplateMode}
                        isSecondaryTemplateMode={isSecondaryTemplateMode}
                        templates={templates}
                      />
                    </div>
                  );
                });
              })()
            ) : (
              // Modalità normale
              filteredWeeks.map((week) => (
                <CompactWeekGrid
                  key={week.weekNumber}
                  weekNumber={week.weekNumber}
                  weekDays={week.days}
                  categories={filteredCategories}
                  contents={filteredContents}
                  vacations={vacations}
                  onEditContent={handleEditContent}
                  onSaveContent={handleSaveContent}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onDuplicate={handleDuplicate}
                  onTogglePublished={handleTogglePublished}
                  onQuickEdit={handleQuickEdit}
                  onLinkHover={handleLinkHover}
                  onLinkClick={handleLinkClick}
                  onDeleteContent={handleDeleteContent}
                  onUpdateVacation={handleUpdateVacation}
                  onDeleteVacation={handleDeleteVacation}
                  highlightedContentId={highlightedContentId}
                  cellOpacity={cellOpacity}
                  endlessMode={false}
                  monthLabelDate={week.monthLabelDate}
                  isPrimaryTemplateMode={isPrimaryTemplateMode}
                  isSecondaryTemplateMode={isSecondaryTemplateMode}
                  templates={templates}
                />
              ))
            )}
          </main>
        </TabsContent>

        <TabsContent value="task" className="m-0">
          <TaskView
            contents={contents}
            categories={categories}
            onTogglePublished={handleTogglePublished}
            onScrollToContent={handleScrollToContent}
          />
        </TabsContent>

        <TabsContent value="tasklist" className="m-0">
          <TaskListView
            contents={contents}
            categories={categories}
            onTogglePublished={handleTogglePublished}
            onScrollToContent={handleScrollToContent}
            onEditContent={(content) => handleEditContent(content)}
          />
        </TabsContent>
      </Tabs>

      <ContentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        content={editingContent}
        categories={categories}
        preselectedCategory={preselectedCategory}
        preselectedDate={preselectedDate}
        preselectedTemplateId={preselectedTemplateId}
        onSave={handleSaveContent}
        onDelete={handleDeleteContent}
        allContents={contents}
        templates={templates}
      />

      <InfoDialog
        open={infoDialogOpen}
        onOpenChange={setInfoDialogOpen}
      />
      </div>
    </>
  );
};

export default Index;
