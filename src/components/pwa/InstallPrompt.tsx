import { useState } from 'react';
import { Download, X, Smartphone, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePWA } from '@/hooks/usePWA';

export function InstallPrompt() {
  const { isInstallable, isInstalled, isIOS, installApp } = usePWA();
  const [dismissed, setDismissed] = useState(false);

  // Don't show if already installed, dismissed, or not installable (and not iOS)
  if (isInstalled || dismissed || (!isInstallable && !isIOS)) {
    return null;
  }

  const handleInstall = async () => {
    const success = await installApp();
    if (!success) {
      setDismissed(true);
    }
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50 animate-in slide-in-from-bottom-4">
      <div className="bg-card border border-border rounded-lg p-4 shadow-lg">
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Smartphone className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground text-sm">
              Installa Planner
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              {isIOS 
                ? "Tocca Condividi e poi 'Aggiungi a Home'" 
                : "Accedi offline e avvia più velocemente"}
            </p>
          </div>
        </div>

        {isIOS ? (
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-md p-2">
            <Share className="h-4 w-4 flex-shrink-0" />
            <span>Tocca l'icona Condividi in Safari, poi "Aggiungi a Home"</span>
          </div>
        ) : (
          <Button
            onClick={handleInstall}
            size="sm"
            className="w-full mt-3"
          >
            <Download className="h-4 w-4 mr-2" />
            Installa App
          </Button>
        )}
      </div>
    </div>
  );
}
