import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { PlannerHeader } from "@/components/planner/PlannerHeader";
import { CompactWeekGrid } from "@/components/planner/CompactWeekGrid";
import { MonthSeparator } from "@/components/planner/MonthSeparator";
import { ContentDialog } from "@/components/planner/ContentDialog";
import { CategoryManager } from "@/components/planner/CategoryManager";
import { SeriesCreator } from "@/components/planner/SeriesCreator";
import { PlannerFilters } from "@/components/planner/PlannerFilters";
import { InfoDialog } from "@/components/planner/InfoDialog";
import { VacationManager } from "@/components/planner/VacationManager";
import { TaskView } from "@/components/planner/TaskView";
import { LoginDialog } from "@/components/auth/LoginDialog";
import { WebSocketSettings, getStoredWsUrl } from "@/components/settings/WebSocketSettings";
import { Category, ContentItem, WeekDay, SeriesConfig, VacationPeriod } from "@/types/planner";
import { User } from "@/types/auth";
import { InitialDataPayload } from "@/types/sync";
import { Button } from "@/components/ui/button";
import { Info, Calendar, ListTodo, LogOut, Wifi, WifiOff, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWebSocket } from "@/hooks/useWebSocket";
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
} from "date-fns";
import { it } from "date-fns/locale";
import { toast } from "sonner";

// WebSocket URL from environment variable, fallback to localStorage
const WS_URL = import.meta.env.VITE_WS_URL as string | undefined;

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
  const [viewMode, setViewMode] = useState<"planner" | "task">("planner");
  const [cellOpacity, setCellOpacity] = useState({ empty: 8, filled: 35 });
  const [endlessMode, setEndlessMode] = useState(false);
  const [monthsToShow, setMonthsToShow] = useState(3);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Filtri
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);

  // Drag & Drop
  const [draggedContent, setDraggedContent] = useState<ContentItem | null>(null);
  const [isAltDrag, setIsAltDrag] = useState(false);

  // Link highlighting
  const [highlightedContentId, setHighlightedContentId] = useState<string | null>(null);

  const [categories, setCategories] = useState<Category[]>([
    { id: "chronicles", name: "CHRONICLES", color: "142 76% 45%" },
    { id: "gaming", name: "GAMING", color: "210 100% 50%" },
    { id: "minecraft", name: "MINECRAFT", color: "0 70% 45%" },
    { id: "rec", name: "REC", color: "270 60% 55%" },
    { id: "vod", name: "VOD", color: "25 95% 53%" },
    { id: "twitch", name: "TWITCH", color: "270 50% 70%" },
  ]);

  const [contents, setContents] = useState<ContentItem[]>([]);
  const [vacations, setVacations] = useState<VacationPeriod[]>([]);

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
    if (data.contents) setContents(data.contents);
    if (data.categories && data.categories.length > 0) setCategories(data.categories);
    if (data.vacations) setVacations(data.vacations);
    toast.success("Dati sincronizzati");
  }, []);

  const handleContentChange = useCallback((type: 'created' | 'updated' | 'deleted', payload: ContentItem | { id: string }) => {
    if (type === 'created') {
      setContents(prev => [...prev, payload as ContentItem]);
    } else if (type === 'updated') {
      setContents(prev => prev.map(c => c.id === (payload as ContentItem).id ? payload as ContentItem : c));
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
      setVacations(prev => [...prev, payload as VacationPeriod]);
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
    if (cachedData.contents.length > 0) setContents(cachedData.contents);
    if (cachedData.categories.length > 0) setCategories(cachedData.categories);
    if (cachedData.vacations.length > 0) setVacations(cachedData.vacations);
  }, [loadFromLocalCache]);

  // Save data to cache when it changes
  useEffect(() => {
    saveToLocalCache({ contents, categories, vacations });
  }, [contents, categories, vacations, saveToLocalCache]);

  const weeks = useMemo(() => {
    if (endlessMode) {
      // In modalità endless, genera settimane per più mesi
      const allWeeks: { weekNumber: number; days: WeekDay[]; monthYear: string; monthLabelDate: Date }[] = [];
      let weekCounter = 1;

      for (let i = 0; i < monthsToShow; i++) {
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
  }, [currentDate, endlessMode, monthsToShow]);

  // Filtro settimane e categorie
  const filteredWeeks = useMemo(() => {
    return weeks.filter((week) => selectedWeek === null || week.weekNumber === selectedWeek);
  }, [weeks, selectedWeek]);

  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => selectedCategory === null || cat.id === selectedCategory);
  }, [categories, selectedCategory]);

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

  const handleAddContent = () => {
    setEditingContent(undefined);
    setPreselectedCategory(undefined);
    setPreselectedDate(undefined);
    setDialogOpen(true);
  };

  const handleEditContent = (
    content?: ContentItem,
    categoryId?: string,
    date?: Date
  ) => {
    setEditingContent(content);
    setPreselectedCategory(categoryId);
    setPreselectedDate(date);
    setDialogOpen(true);
  };

  const handleSaveContent = (
    content: Omit<ContentItem, "id"> & { id?: string }
  ) => {
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
    }
  };

  const handleDeleteContent = (id: string) => {
    setContents((prev) => prev.filter((c) => c.id !== id));
    syncContentDelete(id);
    toast.success("Contenuto eliminato");
  };

  // Gestione categorie
  const handleAddCategory = (name: string, color: string) => {
    const newCategory: Category = {
      id: Date.now().toString(),
      name,
      color,
    };
    setCategories((prev) => [...prev, newCategory]);
    syncCategoryCreate(newCategory);
    toast.success(`Categoria "${name}" aggiunta`);
  };

  const handleUpdateCategory = (id: string, name: string, color: string) => {
    const updatedCategory = { id, name, color };
    setCategories((prev) =>
      prev.map((cat) => (cat.id === id ? updatedCategory : cat))
    );
    syncCategoryUpdate(updatedCategory);
    toast.success(`Categoria aggiornata`);
  };

  const handleDeleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((cat) => cat.id !== id));
    setContents((prev) => prev.filter((c) => c.categoryId !== id));
    syncCategoryDelete(id);
    toast.success("Categoria eliminata");
  };

  // Creazione serie
  const handleCreateSeries = (config: SeriesConfig) => {
    const newContents: ContentItem[] = [];
    let currentDate = config.startDate;

    for (let i = config.startNumber; i <= config.endNumber; i++) {
      // Salta weekend se la frequenza è "weekdays"
      if (config.frequency === "weekdays") {
        while (isWeekend(currentDate)) {
          currentDate = addDays(currentDate, 1);
        }
      }

      const newContent: ContentItem = {
        id: `${Date.now()}_${i}`,
        title: `${config.baseTitle} ${i}`,
        categoryId: config.categoryId,
        date: currentDate,
        published: false,
      };
      newContents.push(newContent);

      // Avanza alla data successiva
      if (config.frequency === "daily") {
        currentDate = addDays(currentDate, 1);
      } else if (config.frequency === "weekdays") {
        currentDate = addDays(currentDate, 1);
      } else if (config.frequency === "weekly") {
        currentDate = addWeeks(currentDate, 1);
      }
    }

    setContents((prev) => [...prev, ...newContents]);
    // Sync each new content to WebSocket
    newContents.forEach(content => syncContentCreate(content));
    toast.success(`Serie creata: ${newContents.length} contenuti aggiunti`);
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

    if (isAltDrag) {
      // ALT + Drag = Duplica
      const duplicated: ContentItem = {
        ...draggedContent,
        id: Date.now().toString(),
        categoryId,
        date,
      };
      setContents((prev) => [...prev, duplicated]);
      toast.success("Contenuto duplicato");
    } else {
      // Drag normale = Sposta
      setContents((prev) =>
        prev.map((c) =>
          c.id === draggedContent.id
            ? { ...c, categoryId, date }
            : c
        )
      );
      toast.success("Contenuto spostato");
    }
    
    setDraggedContent(null);
    setIsAltDrag(false);
  };

  // Duplicazione
  const handleDuplicate = (content: ContentItem, newDate: Date) => {
    const duplicated: ContentItem = {
      ...content,
      id: Date.now().toString(),
      date: newDate,
    };
    setContents((prev) => [...prev, duplicated]);
    toast.success("Contenuto duplicato");
  };

  // Toggle pubblicato
  const handleTogglePublished = (content: ContentItem) => {
    setContents((prev) =>
      prev.map((c) =>
        c.id === content.id ? { ...c, published: !c.published } : c
      )
    );
    toast.success(content.published ? "Segnato come non pubblicato" : "Segnato come pubblicato");
  };

  // Vacations management
  const handleAddVacation = (startDate: Date, endDate: Date, label: string) => {
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

  const handleDeleteVacation = (id: string) => {
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
    // If title is empty, delete the content
    if (!newTitle.trim()) {
      if (content) {
        setContents((prev) => prev.filter((c) => c.id !== content.id));
        toast.success("Contenuto eliminato");
      }
      return;
    }

    if (content) {
      // Update existing content
      setContents((prev) =>
        prev.map((c) => (c.id === content.id ? { ...c, title: newTitle } : c))
      );
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
      
      <div className="min-h-screen bg-background text-foreground">
        <PlannerHeader
          currentDate={currentDate}
          onPreviousMonth={handlePreviousMonth}
          onNextMonth={handleNextMonth}
          onAddContent={handleAddContent}
          cellOpacity={cellOpacity}
          onOpacityChange={setCellOpacity}
          endlessMode={endlessMode}
          onEndlessModeChange={handleEndlessModeToggle}
        />

        <div className="flex items-center justify-between px-6 py-3 border-b border-grid-border">
          <div className="flex gap-2">
            <CategoryManager
              categories={categories}
              onAddCategory={handleAddCategory}
              onUpdateCategory={handleUpdateCategory}
              onDeleteCategory={handleDeleteCategory}
            />
            <SeriesCreator
              categories={categories}
              onCreateSeries={handleCreateSeries}
            />
            <VacationManager
              vacations={vacations}
              onAddVacation={handleAddVacation}
              onDeleteVacation={handleDeleteVacation}
            />
          </div>
          <div className="flex items-center gap-2">
            {/* Connection status indicator */}
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {isConnecting ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>Connessione...</span>
                </>
              ) : isConnected ? (
                <>
                  <Wifi className="h-3 w-3 text-green-500" />
                  <span>Connesso</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-3 w-3 text-muted-foreground" />
                  <span>Offline</span>
                </>
              )}
              {pendingEventsCount > 0 && (
                <span className="ml-1 text-amber-500">({pendingEventsCount} in coda)</span>
              )}
            </div>
            <WebSocketSettings 
              isConnected={isConnected} 
              onUrlChange={setWsUrl} 
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInfoDialogOpen(true)}
              className="gap-2"
            >
              <Info className="h-4 w-4" />
              Scorciatoie
            </Button>
            {user && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="gap-2 text-muted-foreground"
              >
                <LogOut className="h-4 w-4" />
                Esci
              </Button>
            )}
          </div>
        </div>

      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "planner" | "task")} className="w-full">
        <TabsList className="w-full justify-start rounded-none border-b h-auto p-0 bg-transparent">
          <TabsTrigger value="planner" className="gap-2 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
            <Calendar className="h-4 w-4" />
            Planner
          </TabsTrigger>
          <TabsTrigger value="task" className="gap-2 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
            <ListTodo className="h-4 w-4" />
            Task
          </TabsTrigger>
        </TabsList>

        <TabsContent value="planner" className="m-0">
          <PlannerFilters
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            selectedWeek={selectedWeek}
            onWeekChange={setSelectedWeek}
            totalWeeks={weeks.length}
            endlessMode={endlessMode}
          />

          <main 
            ref={scrollContainerRef}
            className={endlessMode ? "p-6 max-h-[calc(100vh-300px)] overflow-y-auto" : "p-6"}
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
                        contents={contents}
                        vacations={vacations}
                        onEditContent={handleEditContent}
                        onDragStart={handleDragStart}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        onDuplicate={handleDuplicate}
                        onTogglePublished={handleTogglePublished}
                        onQuickEdit={handleQuickEdit}
                        onLinkHover={handleLinkHover}
                        onLinkClick={handleLinkClick}
                        highlightedContentId={highlightedContentId}
                        cellOpacity={cellOpacity}
                        endlessMode={endlessMode}
                        monthLabelDate={week.monthLabelDate}
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
                  contents={contents}
                  vacations={vacations}
                  onEditContent={handleEditContent}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onDuplicate={handleDuplicate}
                  onTogglePublished={handleTogglePublished}
                  onQuickEdit={handleQuickEdit}
                  onLinkHover={handleLinkHover}
                  onLinkClick={handleLinkClick}
                  highlightedContentId={highlightedContentId}
                  cellOpacity={cellOpacity}
                  endlessMode={false}
                  monthLabelDate={week.monthLabelDate}
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
      </Tabs>

      <ContentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        content={editingContent}
        categories={categories}
        preselectedCategory={preselectedCategory}
        preselectedDate={preselectedDate}
        onSave={handleSaveContent}
        onDelete={handleDeleteContent}
        allContents={contents}
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
