import { useState, useEffect } from "react";
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
import { Umbrella, Trash2 } from "lucide-react";
import { VacationPeriod } from "@/types/planner";
import { format } from "date-fns";
import { it } from "date-fns/locale";

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
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [label, setLabel] = useState("");

  const handleAdd = () => {
    if (startDate && endDate && label) {
      onAddVacation(new Date(startDate), new Date(endDate), label);
      setStartDate("");
      setEndDate("");
      setLabel("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
            <div className="grid gap-2">
              <Label htmlFor="startDate">Data Inizio</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="endDate">Data Fine</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
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
            <Button onClick={handleAdd}>Aggiungi Periodo</Button>
          </div>

          <div className="space-y-2">
            <Label>Periodi Configurati</Label>
            {vacations.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nessun periodo configurato</p>
            ) : (
              <div className="space-y-2">
                {vacations.map((vacation) => (
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
