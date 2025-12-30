import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Info, Mouse, Calendar, Link2, Layers, Umbrella, Settings2, ListTodo, Grid3X3 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface InfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const InfoDialog = ({ open, onOpenChange }: InfoDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Guida & Scorciatoie
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="flex-1 px-6 py-4">
          <div className="space-y-6">
            {/* Interazioni Celle */}
            <Section
              icon={<Mouse className="h-4 w-4" />}
              title="Interazioni Celle"
              items={[
                { shortcut: "Click su cella vuota", desc: "Inserimento titolo inline rapido" },
                { shortcut: "Click su contenuto", desc: "Modifica titolo inline" },
                { shortcut: "Shift/Ctrl/Alt + Click", desc: "Apri popup dettagli completo" },
                { shortcut: "Invio", desc: "Salva modifica inline" },
                { shortcut: "Esc", desc: "Annulla modifica" },
              ]}
            />

            <Separator />

            {/* Drag & Drop */}
            <Section
              icon={<Grid3X3 className="h-4 w-4" />}
              title="Drag & Drop"
              items={[
                { shortcut: "Drag normale", desc: "Sposta il contenuto in una nuova cella (cambia data/categoria)" },
                { shortcut: "ALT + Drag", desc: "Duplica il contenuto nella nuova cella (mantiene l'originale)" },
              ]}
            />

            <Separator />

            {/* Pubblicazione */}
            <Section
              icon={<Calendar className="h-4 w-4" />}
              title="Stati Pubblicazione"
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
              items={[
                { shortcut: "Icona link", desc: "Indica che il contenuto è collegato ad un altro" },
                { shortcut: "Hover su icona", desc: "Mostra info contenuto collegato ed evidenzia la cella" },
                { shortcut: "Click su icona", desc: "Scrolla automaticamente alla cella collegata" },
              ]}
            />

            <Separator />

            {/* Celle Multiple */}
            <Section
              icon={<Layers className="h-4 w-4" />}
              title="Celle Multiple"
              items={[
                { shortcut: "Più contenuti", desc: "Ogni cella può contenere più contenuti" },
                { shortcut: "+N altri...", desc: "Se più di 3 contenuti, mostra il conteggio rimanente" },
                { shortcut: "Click su header giorno", desc: "Apre popup con tutti gli eventi del giorno" },
              ]}
            />

            <Separator />

            {/* Ferie */}
            <Section
              icon={<Umbrella className="h-4 w-4" />}
              title="Gestione Ferie"
              items={[
                { shortcut: "Gestisci Ferie", desc: "Aggiungi periodi di ferie dal menu Gestione" },
                { shortcut: "Badge viola", desc: "Indica giorni di ferie nel calendario" },
                { shortcut: "Modifica nel popup", desc: "Le ferie sono editabili dal popup del giorno" },
                { shortcut: "Auto-pulizia", desc: "Le ferie scadute vengono evidenziate per la rimozione" },
              ]}
            />

            <Separator />

            {/* Funzionalità */}
            <Section
              icon={<Settings2 className="h-4 w-4" />}
              title="Funzionalità Avanzate"
              items={[
                { shortcut: "Modalità Endless", desc: "Scroll infinito per vedere tutti i mesi" },
                { shortcut: "Settimane passate", desc: "In endless, configura quante settimane prima mostrare" },
                { shortcut: "Filtri categoria", desc: "Filtra la vista per categoria specifica" },
                { shortcut: "Trasparenza celle", desc: "Regola opacità celle vuote/piene nelle impostazioni" },
                { shortcut: "Template", desc: "Crea template con pipeline e checklist predefinite" },
                { shortcut: "Serie", desc: "Genera contenuti ricorrenti automaticamente" },
              ]}
            />

            <Separator />

            {/* Task View */}
            <Section
              icon={<ListTodo className="h-4 w-4" />}
              title="Viste Alternative"
              items={[
                { shortcut: "Planner", desc: "Vista calendario settimanale principale" },
                { shortcut: "Oggi", desc: "Focus sui contenuti del giorno corrente" },
                { shortcut: "Task List", desc: "Lista verticale di tutti i task da completare" },
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
  items: { shortcut: string; desc: string }[];
}

const Section = ({ icon, title, items }: SectionProps) => (
  <div>
    <h3 className="font-semibold mb-3 flex items-center gap-2 text-primary">
      {icon}
      {title}
    </h3>
    <ul className="space-y-2">
      {items.map((item, idx) => (
        <li key={idx} className="flex gap-3 text-sm">
          <span className="font-medium text-foreground min-w-[140px]">{item.shortcut}</span>
          <span className="text-muted-foreground">{item.desc}</span>
        </li>
      ))}
    </ul>
  </div>
);
