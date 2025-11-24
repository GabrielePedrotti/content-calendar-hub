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
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Interazioni Celle</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• <strong>Click su cella vuota:</strong> inserimento titolo inline</li>
              <li>• <strong>Click su contenuto:</strong> modifica titolo inline</li>
              <li>• <strong>Shift/Ctrl/Alt + Click:</strong> apri popup dettagli completo</li>
              <li>• <strong>Invio:</strong> salva modifica inline</li>
              <li>• <strong>Esc:</strong> annulla modifica</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Pubblicazione</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• <strong>Click sul pallino di stato:</strong> cambia stato pubblicato/da fare</li>
              <li>• <strong>Pallino grigio:</strong> contenuto da fare</li>
              <li>• <strong>Pallino verde con spunta:</strong> contenuto pubblicato</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Drag & Drop</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• <strong>Drag normale:</strong> sposta il contenuto in una nuova cella</li>
              <li>• <strong>ALT + Drag:</strong> DUPLICA il contenuto nella nuova cella (mantiene l'originale)</li>
              <li>• <strong>Drag su cella:</strong> cambia data e/o categoria</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Collegamenti</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• <strong>Icona link:</strong> indica contenuto collegato</li>
              <li>• <strong>Hover su icona:</strong> mostra info contenuto collegato ed evidenzia la cella</li>
              <li>• <strong>Click su icona:</strong> scrolla alla cella collegata</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Celle Multiple</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Ogni cella può contenere più contenuti</li>
              <li>• Se più di 3, mostra "+N altri..."</li>
              <li>• Click/drag funzionano sui singoli contenuti</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
