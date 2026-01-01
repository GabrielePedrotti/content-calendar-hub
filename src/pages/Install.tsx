import { Download, Smartphone, Wifi, Zap, Share, Check, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { usePWA } from '@/hooks/usePWA';
import { Link } from 'react-router-dom';

export default function Install() {
  const { isInstallable, isInstalled, isIOS, installApp } = usePWA();

  const features = [
    {
      icon: Zap,
      title: "Accesso Veloce",
      description: "Avvia l'app direttamente dalla home del tuo dispositivo"
    },
    {
      icon: Wifi,
      title: "Funziona Offline",
      description: "Accedi ai tuoi contenuti anche senza connessione"
    },
    {
      icon: Smartphone,
      title: "Esperienza Nativa",
      description: "Interfaccia a schermo intero come un'app nativa"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-lg font-semibold text-foreground">Installa App</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-lg">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 mb-4">
            <Smartphone className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Planner Editoriale
          </h2>
          <p className="text-muted-foreground">
            Installa l'app per un'esperienza migliore
          </p>
        </div>

        {/* Status Card */}
        {isInstalled ? (
          <Card className="mb-6 border-primary/50 bg-primary/5">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-full">
                <Check className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">App Installata!</p>
                <p className="text-sm text-muted-foreground">
                  Puoi trovare l'app nella home del tuo dispositivo
                </p>
              </div>
            </CardContent>
          </Card>
        ) : isIOS ? (
          <Card className="mb-6">
            <CardContent className="p-4">
              <h3 className="font-medium text-foreground mb-3">Come installare su iPhone/iPad</h3>
              <ol className="space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-medium">1</span>
                  <span className="text-muted-foreground">
                    Tocca l'icona <Share className="inline h-4 w-4 mx-1" /> Condividi nella barra di Safari
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-medium">2</span>
                  <span className="text-muted-foreground">
                    Scorri e tocca "Aggiungi a Home"
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-medium">3</span>
                  <span className="text-muted-foreground">
                    Tocca "Aggiungi" in alto a destra
                  </span>
                </li>
              </ol>
            </CardContent>
          </Card>
        ) : isInstallable ? (
          <Button onClick={installApp} size="lg" className="w-full mb-6">
            <Download className="h-5 w-5 mr-2" />
            Installa App
          </Button>
        ) : (
          <Card className="mb-6 border-muted">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground">
                L'installazione non è disponibile in questo browser. 
                Prova ad aprire questa pagina in Chrome, Edge o Safari.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Features */}
        <div className="space-y-3">
          {features.map((feature, index) => (
            <Card key={index} className="bg-card/50">
              <CardContent className="p-4 flex items-start gap-4">
                <div className="p-2 bg-muted rounded-lg">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground text-sm">{feature.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{feature.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Back to App */}
        <div className="mt-8 text-center">
          <Link to="/">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Torna al Planner
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
