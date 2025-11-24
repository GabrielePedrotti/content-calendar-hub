import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

interface PlannerHeaderProps {
  currentDate: Date;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onAddContent: () => void;
}

export const PlannerHeader = ({
  currentDate,
  onPreviousMonth,
  onNextMonth,
  onAddContent,
}: PlannerHeaderProps) => {
  return (
    <header className="flex items-center justify-between p-6 border-b border-grid-border">
      <div className="flex items-center gap-4">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Planner Editoriale
        </h1>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onPreviousMonth}
            className="hover:bg-cell-hover"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <span className="text-lg font-semibold min-w-[200px] text-center">
            {format(currentDate, "MMMM yyyy", { locale: it })}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={onNextMonth}
            className="hover:bg-cell-hover"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
      <Button onClick={onAddContent} className="gap-2">
        <Plus className="h-4 w-4" />
        Aggiungi Contenuto
      </Button>
    </header>
  );
};
