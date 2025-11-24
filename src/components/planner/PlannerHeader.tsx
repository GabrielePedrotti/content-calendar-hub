import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Settings2, Infinity } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface PlannerHeaderProps {
  currentDate: Date;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onAddContent: () => void;
  cellOpacity: { empty: number; filled: number };
  onOpacityChange: (opacity: { empty: number; filled: number }) => void;
  endlessMode: boolean;
  onEndlessModeChange: (enabled: boolean) => void;
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
}: PlannerHeaderProps) => {
  return (
    <header className="flex items-center justify-between p-6 border-b border-grid-border">
      <div className="flex items-center gap-4">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Planner Editoriale
        </h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 bg-muted/30 px-4 py-2 rounded-lg border border-border">
            <Infinity className={endlessMode ? "h-5 w-5 text-primary animate-pulse" : "h-5 w-5 text-muted-foreground"} />
            <Label htmlFor="endless-mode" className="text-sm font-medium cursor-pointer">
              Modalità Endless
            </Label>
            <Switch
              id="endless-mode"
              checked={endlessMode}
              onCheckedChange={onEndlessModeChange}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onPreviousMonth}
              className="hover:bg-cell-hover"
              disabled={endlessMode}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <span className="text-lg font-semibold min-w-[200px] text-center">
              {endlessMode ? "Scroll infinito" : format(currentDate, "MMMM yyyy", { locale: it })}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={onNextMonth}
              className="hover:bg-cell-hover"
              disabled={endlessMode}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon">
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
        <Button onClick={onAddContent} className="gap-2">
          <Plus className="h-4 w-4" />
          Aggiungi Contenuto
        </Button>
      </div>
    </header>
  );
};
