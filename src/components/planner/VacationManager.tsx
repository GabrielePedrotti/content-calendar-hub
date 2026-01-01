import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Umbrella, Trash2, CalendarDays } from "lucide-react";
import { VacationPeriod } from "@/types/planner";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, isBefore, startOfDay } from "date-fns";
import { it } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface VacationManagerProps {
  vacations: VacationPeriod[];
  onAddVacation: (startDate: Date, endDate: Date, label: string) => void;
  onDeleteVacation: (id: string) => void;
}

export const VacationManager = ({
  vacations,
  onAddVacation,
  onDeleteVacation,
}: VacationManagerProps) => {
  const [open, setOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [label, setLabel] = useState("");

  const today = startOfDay(new Date());

  // Filter out expired vacations (endDate before today)
  const activeVacations = useMemo(() => {
    return vacations.filter((v) => !isBefore(v.endDate, today));
  }, [vacations, today]);

  const expiredVacations = useMemo(() => {
    return vacations.filter((v) => isBefore(v.endDate, today));
  }, [vacations, today]);

  // Auto-clean expired vacations when dialog opens
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen && expiredVacations.length > 0) {
      // Automatically remove expired vacations when opening the manager
      expiredVacations.forEach((v) => onDeleteVacation(v.id));
    }
  };

  const handleAdd = () => {
    if (startDate && endDate && label) {
      onAddVacation(startDate, endDate, label);
      setStartDate(undefined);
      setEndDate(undefined);
      setLabel("");
    }
  };

  const handleCleanExpired = () => {
    expiredVacations.forEach((v) => onDeleteVacation(v.id));
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Umbrella className="h-4 w-4" />
          Gestisci Ferie
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Gestisci Periodi di Ferie</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Data Inizio</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarDays className="h-4 w-4 mr-2" />
                      {startDate ? format(startDate, "d MMM yyyy", { locale: it }) : "Seleziona"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      locale={it}
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="grid gap-2">
                <Label>Data Fine</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarDays className="h-4 w-4 mr-2" />
                      {endDate ? format(endDate, "d MMM yyyy", { locale: it }) : "Seleziona"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      locale={it}
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="label">Etichetta</Label>
              <Input
                id="label"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="es. Vacanze Natale"
              />
            </div>
            <Button onClick={handleAdd} disabled={!startDate || !endDate || !label}>
              Aggiungi Periodo
            </Button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Periodi Attivi</Label>
              {expiredVacations.length > 0 && (
                <Button variant="outline" size="sm" onClick={handleCleanExpired} className="text-xs h-7">
                  <Trash2 className="h-3 w-3 mr-1" />
                  Rimuovi scaduti ({expiredVacations.length})
                </Button>
              )}
            </div>
            {activeVacations.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nessun periodo attivo</p>
            ) : (
              <div className="space-y-2">
                {activeVacations.map((vacation) => (
                  <div
                    key={vacation.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
                  >
                    <div>
                      <div className="font-medium">{vacation.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {format(vacation.startDate, "d MMM yyyy", { locale: it })} –{" "}
                        {format(vacation.endDate, "d MMM yyyy", { locale: it })}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteVacation(vacation.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
