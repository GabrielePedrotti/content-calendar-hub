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
import { ListOrdered } from "lucide-react";
import { format } from "date-fns";

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
  const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [frequency, setFrequency] = useState<"daily" | "weekdays" | "weekly">("daily");

  const handleCreate = () => {
    if (!baseTitle.trim() || !categoryId || !startDate) return;

    onCreateSeries({
      baseTitle: baseTitle.trim(),
      startNumber,
      endNumber,
      categoryId,
      startDate: new Date(startDate),
      frequency,
    });

    // Reset form
    setBaseTitle("");
    setStartNumber(1);
    setEndNumber(10);
    setCategoryId("");
    setStartDate(format(new Date(), "yyyy-MM-dd"));
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
              <Label htmlFor="start-date">Data di Partenza</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
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
