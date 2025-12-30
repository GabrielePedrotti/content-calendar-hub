import { format } from "date-fns";
import { it } from "date-fns/locale";
import { CalendarDays } from "lucide-react";

interface MonthSeparatorProps {
  date: Date;
}

export const MonthSeparator = ({ date }: MonthSeparatorProps) => {
  const month = format(date, "MMMM", { locale: it });
  const year = format(date, "yyyy");
  const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1);

  return (
    <div className="sticky top-0 z-20 py-3 bg-background/95 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-primary/20 to-accent/10 border border-primary/30">
          <CalendarDays className="h-5 w-5 text-primary" />
          <div className="flex items-baseline gap-2">
            <h2 className="text-xl font-bold text-foreground">
              {capitalizedMonth}
            </h2>
            <span className="text-sm font-medium text-muted-foreground">
              {year}
            </span>
          </div>
        </div>
        <div className="flex-1 h-px bg-gradient-to-r from-primary/30 to-transparent" />
      </div>
    </div>
  );
};
