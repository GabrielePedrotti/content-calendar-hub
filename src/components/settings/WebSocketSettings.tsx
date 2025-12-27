import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Settings2, Wifi, WifiOff, Trash2 } from "lucide-react";
import { toast } from "sonner";

const WS_URL_KEY = "planner_ws_url";

export const getStoredWsUrl = (): string | null => {
  return localStorage.getItem(WS_URL_KEY);
};

export const setStoredWsUrl = (url: string | null) => {
  if (url) {
    localStorage.setItem(WS_URL_KEY, url);
  } else {
    localStorage.removeItem(WS_URL_KEY);
  }
};

interface WebSocketSettingsProps {
  isConnected: boolean;
  onUrlChange: (url: string | null) => void;
}

export const WebSocketSettings = ({ isConnected, onUrlChange }: WebSocketSettingsProps) => {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");

  useEffect(() => {
    const stored = getStoredWsUrl();
    if (stored) {
      setUrl(stored);
    }
  }, [open]);

  const handleSave = () => {
    const trimmedUrl = url.trim();
    if (trimmedUrl && !trimmedUrl.startsWith("ws://") && !trimmedUrl.startsWith("wss://")) {
      toast.error("L'URL deve iniziare con ws:// o wss://");
      return;
    }

    const finalUrl = trimmedUrl || null;
    setStoredWsUrl(finalUrl);
    onUrlChange(finalUrl);
    setOpen(false);
    toast.success(finalUrl ? "URL WebSocket salvato" : "WebSocket disabilitato");
  };

  const handleClear = () => {
    setUrl("");
    setStoredWsUrl(null);
    onUrlChange(null);
    setOpen(false);
    toast.success("WebSocket disabilitato");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Settings2 className="h-4 w-4" />
          <span 
            className={`absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full ${
              isConnected ? "bg-green-500" : "bg-muted-foreground/50"
            }`}
          />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isConnected ? (
              <Wifi className="h-5 w-5 text-green-500" />
            ) : (
              <WifiOff className="h-5 w-5 text-muted-foreground" />
            )}
            Impostazioni WebSocket
          </DialogTitle>
          <DialogDescription>
            Inserisci l'URL del tuo server WebSocket per sincronizzare i dati in tempo reale.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="ws-url">URL WebSocket</Label>
            <Input
              id="ws-url"
              placeholder="wss://tuo-server.com/ws"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Esempio: wss://api.tuodominio.com/ws
            </p>
          </div>

          <div className="rounded-lg border p-3 space-y-2 bg-muted/30">
            <p className="text-sm font-medium">Stato attuale</p>
            <div className="flex items-center gap-2 text-sm">
              {isConnected ? (
                <>
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-green-600">Connesso</span>
                </>
              ) : getStoredWsUrl() ? (
                <>
                  <span className="h-2 w-2 rounded-full bg-yellow-500" />
                  <span className="text-yellow-600">Disconnesso</span>
                </>
              ) : (
                <>
                  <span className="h-2 w-2 rounded-full bg-muted-foreground" />
                  <span className="text-muted-foreground">Modalità offline</span>
                </>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:gap-0">
          {getStoredWsUrl() && (
            <Button variant="outline" onClick={handleClear} className="gap-2">
              <Trash2 className="h-4 w-4" />
              Rimuovi
            </Button>
          )}
          <Button onClick={handleSave}>Salva</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
