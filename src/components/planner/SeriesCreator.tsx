import { useState } from "react";
import { SeriesConfig, Category } from "@/types/planner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ListOrdered, CalendarDays } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface SeriesCreatorProps {
  categories: Category[];
  onCreateSeries: (config: SeriesConfig) => void;
}

export const SeriesCreator = ({
  categories,
  onCreateSeries,
}: SeriesCreatorProps) => {
  const [open, setOpen] = useState(false);
  const [baseTitle, setBaseTitle] = useState("");
  const [startNumber, setStartNumber] = useState(1);
  const [endNumber, setEndNumber] = useState(10);
  const [categoryId, setCategoryId] = useState("");
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [frequency, setFrequency] = useState<"daily" | "weekdays" | "weekly">("daily");

  const handleCreate = () => {
    if (!baseTitle.trim() || !categoryId) return;

    onCreateSeries({
      baseTitle: baseTitle.trim(),
      startNumber,
      endNumber,
      categoryId,
      startDate,
      frequency,
    });

    // Reset form
    setBaseTitle("");
    setStartNumber(1);
    setEndNumber(10);
    setCategoryId("");
    setStartDate(new Date());
    setFrequency("daily");
    setOpen(false);
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} className="gap-2" variant="outline">
        <ListOrdered className="h-4 w-4" />
        Crea Serie
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Crea Serie Automatica</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="base-title">Titolo Base</Label>
              <Input
                id="base-title"
                value={baseTitle}
                onChange={(e) => setBaseTitle(e.target.value)}
                placeholder="es. Outer Wilds"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="start-num">Numero Iniziale</Label>
                <Input
                  id="start-num"
                  type="number"
                  value={startNumber}
                  onChange={(e) => setStartNumber(parseInt(e.target.value) || 1)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="end-num">Numero Finale</Label>
                <Input
                  id="end-num"
                  type="number"
                  value={endNumber}
                  onChange={(e) => setEndNumber(parseInt(e.target.value) || 10)}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category">Categoria</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Data di Partenza</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal")}
                  >
                    <CalendarDays className="h-4 w-4 mr-2" />
                    {format(startDate, "d MMM yyyy", { locale: it })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => date && setStartDate(date)}
                    locale={it}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="frequency">Frequenza</Label>
              <Select
                value={frequency}
                onValueChange={(v) => setFrequency(v as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Ogni giorno</SelectItem>
                  <SelectItem value="weekdays">Solo giorni feriali</SelectItem>
                  <SelectItem value="weekly">Una volta a settimana</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Annulla
            </Button>
            <Button onClick={handleCreate}>Crea Serie</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
