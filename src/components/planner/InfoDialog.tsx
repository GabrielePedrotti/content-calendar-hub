import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Info } from "lucide-react";

interface InfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const InfoDialog = ({ open, onOpenChange }: InfoDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Scorciatoie e Comandi
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Modifica Contenuti</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• <kbd className="px-2 py-1 bg-muted rounded text-xs">Click</kbd> su cella = modifica titolo inline</li>
              <li>• <kbd className="px-2 py-1 bg-muted rounded text-xs">Shift</kbd> + <kbd className="px-2 py-1 bg-muted rounded text-xs">Click</kbd> o <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl</kbd> + <kbd className="px-2 py-1 bg-muted rounded text-xs">Click</kbd> = apri dettagli completi</li>
              <li>• <kbd className="px-2 py-1 bg-muted rounded text-xs">Invio</kbd> = salva modifiche</li>
              <li>• <kbd className="px-2 py-1 bg-muted rounded text-xs">Esc</kbd> = annulla modifiche</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Stato Pubblicazione</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Click sull'indicatore <span className="inline-flex h-3 w-3 rounded-full bg-muted mx-1"></span> = cambia stato pubblicato/da fare</li>
              <li>• Grigio = da fare</li>
              <li>• Verde con spunta = pubblicato</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Drag & Drop</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Trascina contenuto su un'altra cella = sposta data/categoria</li>
              <li>• Menu contestuale (⋮) → Duplica = copia contenuto</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Contenuti Collegati</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Icona 🔗 accanto al titolo = contenuto collegato</li>
              <li>• Hover sull'icona = vedi dettagli collegamento</li>
              <li>• Nei dettagli avanzati puoi collegare/scollegare contenuti</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
