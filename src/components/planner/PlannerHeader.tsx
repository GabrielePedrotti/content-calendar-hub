import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus, Info, Wifi, WifiOff, Loader2, LogOut, MoreHorizontal } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Settings2, Infinity } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ReactNode } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface PlannerHeaderProps {
  currentDate: Date;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onAddContent: () => void;
  cellOpacity: { empty: number; filled: number };
  onOpacityChange: (opacity: { empty: number; filled: number }) => void;
  endlessMode: boolean;
  onEndlessModeChange: (enabled: boolean) => void;
  endlessWeeksBefore?: number;
  onEndlessWeeksBeforeChange?: (weeks: number) => void;
  managementButtons?: ReactNode;
  isConnecting?: boolean;
  isConnected?: boolean;
  pendingEventsCount?: number;
  settingsButton?: ReactNode;
  onInfoClick?: () => void;
  user?: { name?: string; email: string } | null;
  onLogout?: () => void;
}

export const PlannerHeader = ({
  currentDate,
  onPreviousMonth,
  onNextMonth,
  onAddContent,
  cellOpacity,
  onOpacityChange,
  endlessMode,
  onEndlessModeChange,
  endlessWeeksBefore,
  onEndlessWeeksBeforeChange,
  managementButtons,
  isConnecting,
  isConnected,
  pendingEventsCount,
  onInfoClick,
  user,
  onLogout,
}: PlannerHeaderProps) => {
  return (
    <header className="flex items-center justify-between px-4 py-2 border-b border-grid-border">
      <div className="flex items-center gap-2">
        <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Planner
        </h1>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1.5 bg-muted/30 px-2 py-1 rounded-md border border-border">
              <Infinity className={endlessMode ? "h-3.5 w-3.5 text-primary" : "h-3.5 w-3.5 text-muted-foreground"} />
              <Switch
                id="endless-mode"
                checked={endlessMode}
                onCheckedChange={onEndlessModeChange}
                className="scale-75"
              />
            </div>
          </TooltipTrigger>
          <TooltipContent>Modalità Endless</TooltipContent>
        </Tooltip>
        
        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            onClick={onPreviousMonth}
            className="hover:bg-cell-hover h-7 w-7"
            disabled={endlessMode}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <span className="text-xs font-medium min-w-[100px] text-center">
            {endlessMode ? "∞" : format(currentDate, "MMM yyyy", { locale: it })}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={onNextMonth}
            className="hover:bg-cell-hover h-7 w-7"
            disabled={endlessMode}
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
        
        <div className="w-px h-5 bg-border" />
        
        {/* Management buttons in dropdown */}
        {managementButtons && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-7 gap-1 text-xs">
                <MoreHorizontal className="h-3.5 w-3.5" />
                Gestione
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="flex flex-wrap gap-1.5 p-2 max-w-md">
              {managementButtons}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      
      <div className="flex items-center gap-1.5">
        {/* Connection status - compact */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1 px-1.5">
              {isConnecting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
              ) : isConnected ? (
                <Wifi className="h-3.5 w-3.5 text-green-500" />
              ) : (
                <WifiOff className="h-3.5 w-3.5 text-muted-foreground" />
              )}
              {pendingEventsCount && pendingEventsCount > 0 && (
                <span className="text-[10px] text-amber-500 font-medium">{pendingEventsCount}</span>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            {isConnecting ? "Connessione..." : isConnected ? "Connesso" : "Offline"}
            {pendingEventsCount && pendingEventsCount > 0 && ` (${pendingEventsCount} in coda)`}
          </TooltipContent>
        </Tooltip>
        
        {onInfoClick && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onInfoClick}
                className="h-7 w-7"
              >
                <Info className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Scorciatoie</TooltipContent>
          </Tooltip>
        )}
        
        <Popover>
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <Settings2 className="h-3.5 w-3.5" />
                </Button>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent>Impostazioni</TooltipContent>
          </Tooltip>
          <PopoverContent className="w-72">
            <div className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-medium text-xs">Trasparenza Celle</h4>
                <div className="space-y-2">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] text-muted-foreground">Vuote</label>
                      <span className="text-[10px] font-mono">{cellOpacity.empty}%</span>
                    </div>
                    <Slider
                      value={[cellOpacity.empty]}
                      onValueChange={([value]) => onOpacityChange({ ...cellOpacity, empty: value })}
                      min={0}
                      max={100}
                      step={1}
                      className="h-4"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] text-muted-foreground">Piene</label>
                      <span className="text-[10px] font-mono">{cellOpacity.filled}%</span>
                    </div>
                    <Slider
                      value={[cellOpacity.filled]}
                      onValueChange={([value]) => onOpacityChange({ ...cellOpacity, filled: value })}
                      min={0}
                      max={100}
                      step={1}
                      className="h-4"
                    />
                  </div>
                </div>
              </div>
              
              {endlessMode && onEndlessWeeksBeforeChange !== undefined && endlessWeeksBefore !== undefined && (
                <div className="space-y-2 border-t pt-3">
                  <h4 className="font-medium text-xs">Settimane Passate (Endless)</h4>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] text-muted-foreground">Mostra settimane prima</label>
                    <span className="text-[10px] font-mono">{endlessWeeksBefore}</span>
                  </div>
                  <Slider
                    value={[endlessWeeksBefore]}
                    onValueChange={([value]) => onEndlessWeeksBeforeChange?.(value)}
                    min={0}
                    max={12}
                    step={1}
                    className="h-4"
                  />
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
        
        <Button onClick={onAddContent} size="sm" className="gap-1 h-7 text-xs">
          <Plus className="h-3 w-3" />
          Nuovo
        </Button>
        
        {user && onLogout && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onLogout}
                className="h-7 w-7 text-muted-foreground"
              >
                <LogOut className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Esci</TooltipContent>
          </Tooltip>
        )}
      </div>
    </header>
  );
};