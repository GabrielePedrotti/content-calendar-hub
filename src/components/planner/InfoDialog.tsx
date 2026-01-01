import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Info, Mouse, Calendar, Link2, Layers, Umbrella, Settings2, ListTodo, Grid3X3, Keyboard, LayoutGrid } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface InfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const InfoDialog = ({ open, onOpenChange }: InfoDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b bg-muted/30 shrink-0">
          <DialogTitle className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Info className="h-5 w-5 text-primary" />
            </div>
            <div>
              <span className="text-lg">Guida & Scorciatoie</span>
              <p className="text-xs text-muted-foreground font-normal mt-0.5">
                Tutte le funzionalità del planner
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="flex-1 min-h-0">
          <div className="p-6 space-y-6">
            {/* Interazioni Celle */}
            <Section
              icon={<Mouse className="h-4 w-4" />}
              title="Interazioni Celle"
              color="blue"
              items={[
                { shortcut: "Click su cella vuota", desc: "Inserimento titolo inline rapido" },
                { shortcut: "Click su contenuto", desc: "Modifica titolo inline" },
                { shortcut: "Shift/Ctrl/Alt + Click", desc: "Apri popup dettagli completo" },
                { shortcut: "Invio", desc: "Salva modifica inline" },
                { shortcut: "Esc", desc: "Annulla modifica" },
              ]}
            />

            <Separator />

            {/* Scorciatoie da tastiera */}
            <Section
              icon={<Keyboard className="h-4 w-4" />}
              title="Scorciatoie Tastiera"
              color="purple"
              items={[
                { shortcut: "N", desc: "Nuovo contenuto (usa categoria/data sotto il mouse)" },
                { shortcut: "C", desc: "Elimina il contenuto sotto il mouse" },
                { shortcut: "1 + Click", desc: "Crea contenuto con template primario" },
                { shortcut: "2 + Click", desc: "Crea contenuto con template secondario" },
              ]}
            />

            <Separator />

            {/* Drag & Drop */}
            <Section
              icon={<Grid3X3 className="h-4 w-4" />}
              title="Drag & Drop"
              color="orange"
              items={[
                { shortcut: "Drag normale", desc: "Sposta il contenuto in una nuova cella" },
                { shortcut: "ALT + Drag", desc: "Duplica il contenuto nella nuova cella" },
              ]}
            />

            <Separator />

            {/* Pubblicazione */}
            <Section
              icon={<Calendar className="h-4 w-4" />}
              title="Stati Pubblicazione"
              color="green"
              items={[
                { shortcut: "Click sul pallino", desc: "Cambia stato pubblicato/da fare" },
                { shortcut: "Pallino grigio", desc: "Contenuto da completare" },
                { shortcut: "Pallino verde ✓", desc: "Contenuto pubblicato" },
              ]}
            />

            <Separator />

            {/* Collegamenti */}
            <Section
              icon={<Link2 className="h-4 w-4" />}
              title="Collegamenti tra Contenuti"
              color="cyan"
              items={[
                { shortcut: "Icona link", desc: "Indica contenuto collegato" },
                { shortcut: "Hover su icona", desc: "Evidenzia la cella collegata" },
                { shortcut: "Click su icona", desc: "Scrolla alla cella collegata" },
              ]}
            />

            <Separator />

            {/* Celle Multiple */}
            <Section
              icon={<Layers className="h-4 w-4" />}
              title="Celle Multiple"
              color="indigo"
              items={[
                { shortcut: "Più contenuti", desc: "Ogni cella può contenere più contenuti" },
                { shortcut: "+N altri...", desc: "Mostra conteggio se più di 3 contenuti" },
                { shortcut: "Click header giorno", desc: "Apre popup con tutti gli eventi" },
              ]}
            />

            <Separator />

            {/* Ferie */}
            <Section
              icon={<Umbrella className="h-4 w-4" />}
              title="Gestione Ferie"
              color="violet"
              items={[
                { shortcut: "Gestisci Ferie", desc: "Aggiungi periodi dal menu Gestione" },
                { shortcut: "Badge viola", desc: "Indica giorni di ferie" },
                { shortcut: "Modifica nel popup", desc: "Ferie editabili dal popup giorno" },
              ]}
            />

            <Separator />

            {/* Funzionalità Avanzate */}
            <Section
              icon={<Settings2 className="h-4 w-4" />}
              title="Funzionalità Avanzate"
              color="amber"
              items={[
                { shortcut: "Modalità Endless", desc: "Scroll infinito per tutti i mesi" },
                { shortcut: "Filtri categoria", desc: "Filtra vista per categoria" },
                { shortcut: "Template", desc: "Crea template con pipeline e checklist" },
                { shortcut: "Serie", desc: "Genera contenuti ricorrenti" },
              ]}
            />

            <Separator />

            {/* Viste */}
            <Section
              icon={<LayoutGrid className="h-4 w-4" />}
              title="Viste Disponibili"
              color="teal"
              items={[
                { shortcut: "Planner", desc: "Vista calendario settimanale" },
                { shortcut: "Oggi", desc: "Focus sui contenuti del giorno" },
                { shortcut: "Task List", desc: "Lista verticale di tutti i task" },
                { shortcut: "Kanban", desc: "Vista a colonne per scadenza" },
              ]}
            />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

interface SectionProps {
  icon: React.ReactNode;
  title: string;
  color: string;
  items: { shortcut: string; desc: string }[];
}

const colorClasses: Record<string, { bg: string; text: string; badge: string }> = {
  blue: { bg: 'bg-blue-500/10', text: 'text-blue-500', badge: 'bg-blue-500/15 text-blue-600 border-blue-500/30' },
  purple: { bg: 'bg-purple-500/10', text: 'text-purple-500', badge: 'bg-purple-500/15 text-purple-600 border-purple-500/30' },
  orange: { bg: 'bg-orange-500/10', text: 'text-orange-500', badge: 'bg-orange-500/15 text-orange-600 border-orange-500/30' },
  green: { bg: 'bg-green-500/10', text: 'text-green-500', badge: 'bg-green-500/15 text-green-600 border-green-500/30' },
  cyan: { bg: 'bg-cyan-500/10', text: 'text-cyan-500', badge: 'bg-cyan-500/15 text-cyan-600 border-cyan-500/30' },
  indigo: { bg: 'bg-indigo-500/10', text: 'text-indigo-500', badge: 'bg-indigo-500/15 text-indigo-600 border-indigo-500/30' },
  violet: { bg: 'bg-violet-500/10', text: 'text-violet-500', badge: 'bg-violet-500/15 text-violet-600 border-violet-500/30' },
  amber: { bg: 'bg-amber-500/10', text: 'text-amber-500', badge: 'bg-amber-500/15 text-amber-600 border-amber-500/30' },
  teal: { bg: 'bg-teal-500/10', text: 'text-teal-500', badge: 'bg-teal-500/15 text-teal-600 border-teal-500/30' },
};

const Section = ({ icon, title, color, items }: SectionProps) => {
  const colors = colorClasses[color] || colorClasses.blue;
  
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <div className={`p-1.5 rounded-md ${colors.bg}`}>
          <span className={colors.text}>{icon}</span>
        </div>
        <h3 className="font-semibold text-foreground">{title}</h3>
      </div>
      <div className="grid gap-2 ml-8">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-start gap-3 text-sm">
            <Badge 
              variant="outline" 
              className={`font-mono text-xs shrink-0 ${colors.badge}`}
            >
              {item.shortcut}
            </Badge>
            <span className="text-muted-foreground">{item.desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
