import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus, Info, Wifi, WifiOff, Loader2, LogOut } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Settings2, Infinity } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ReactNode } from "react";

interface PlannerHeaderProps {
  currentDate: Date;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onAddContent: () => void;
  cellOpacity: { empty: number; filled: number };
  onOpacityChange: (opacity: { empty: number; filled: number }) => void;
  endlessMode: boolean;
  onEndlessModeChange: (enabled: boolean) => void;
  // Management buttons
  managementButtons?: ReactNode;
  // Connection status
  isConnecting?: boolean;
  isConnected?: boolean;
  pendingEventsCount?: number;
  // Settings & actions
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
  managementButtons,
  isConnecting,
  isConnected,
  pendingEventsCount,
  settingsButton,
  onInfoClick,
  user,
  onLogout,
}: PlannerHeaderProps) => {
  return (
    <header className="flex items-center justify-between px-6 py-3 border-b border-grid-border">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Planner Editoriale
        </h1>
        <div className="flex items-center gap-2 bg-muted/30 px-3 py-1.5 rounded-lg border border-border">
          <Infinity className={endlessMode ? "h-4 w-4 text-primary animate-pulse" : "h-4 w-4 text-muted-foreground"} />
          <Label htmlFor="endless-mode" className="text-xs font-medium cursor-pointer">
            Endless
          </Label>
          <Switch
            id="endless-mode"
            checked={endlessMode}
            onCheckedChange={onEndlessModeChange}
            className="scale-90"
          />
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onPreviousMonth}
            className="hover:bg-cell-hover h-8 w-8"
            disabled={endlessMode}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-semibold min-w-[140px] text-center">
            {endlessMode ? "Scroll infinito" : format(currentDate, "MMMM yyyy", { locale: it })}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={onNextMonth}
            className="hover:bg-cell-hover h-8 w-8"
            disabled={endlessMode}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Separator */}
        <div className="w-px h-6 bg-border" />
        
        {/* Management buttons */}
        {managementButtons && (
          <div className="flex gap-1.5 flex-wrap">
            {managementButtons}
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        {/* Connection status */}
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
          {pendingEventsCount && pendingEventsCount > 0 && (
            <span className="ml-1 text-amber-500">({pendingEventsCount} in coda)</span>
          )}
        </div>
        
        {settingsButton}
        
        {onInfoClick && (
          <Button
            variant="outline"
            size="sm"
            onClick={onInfoClick}
            className="gap-1.5 h-8"
          >
            <Info className="h-3.5 w-3.5" />
            Scorciatoie
          </Button>
        )}
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon" className="h-8 w-8">
              <Settings2 className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <h4 className="font-medium text-sm">Trasparenza Celle</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs text-muted-foreground">
                      Celle vuote
                    </label>
                    <span className="text-xs font-mono">{cellOpacity.empty}%</span>
                  </div>
                  <Slider
                    value={[cellOpacity.empty]}
                    onValueChange={([value]) =>
                      onOpacityChange({ ...cellOpacity, empty: value })
                    }
                    min={0}
                    max={100}
                    step={1}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs text-muted-foreground">
                      Celle piene
                    </label>
                    <span className="text-xs font-mono">{cellOpacity.filled}%</span>
                  </div>
                  <Slider
                    value={[cellOpacity.filled]}
                    onValueChange={([value]) =>
                      onOpacityChange({ ...cellOpacity, filled: value })
                    }
                    min={0}
                    max={100}
                    step={1}
                  />
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        
        <Button onClick={onAddContent} size="sm" className="gap-1.5 h-8">
          <Plus className="h-3.5 w-3.5" />
          Aggiungi
        </Button>
        
        {user && onLogout && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className="gap-1.5 text-muted-foreground h-8"
          >
            <LogOut className="h-3.5 w-3.5" />
            Esci
          </Button>
        )}
      </div>
    </header>
  );
};
