import { format } from "date-fns";
import { it } from "date-fns/locale";

interface MonthSeparatorProps {
  date: Date;
}

export const MonthSeparator = ({ date }: MonthSeparatorProps) => {
  const rawLabel = format(date, "MMMM yyyy", { locale: it });
  const label = rawLabel.charAt(0).toUpperCase() + rawLabel.slice(1);

  return (
    <div className="relative my-8 first:mt-0">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t-2 border-primary/20"></div>
      </div>
      <div className="relative flex justify-center">
        <div className="bg-background px-6 py-2 rounded-full border-2 border-primary/30 shadow-lg">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient">
            {label}
          </h2>
        </div>
      </div>
    </div>
  );
};
