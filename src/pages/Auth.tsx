import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Calendar, Sparkles } from 'lucide-react';

interface AuthPageProps {
  onLogin: (email: string, password: string) => void;
  isLoading?: boolean;
  error?: string | null;
}

export default function Auth({ onLogin, isLoading = false, error = null }: AuthPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    onLogin(email, password);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <main className="flex-1 flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-md space-y-8">
          {/* Logo and title */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
              <Calendar className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              Planner Editoriale
            </h1>
            <p className="text-muted-foreground mt-2">
              Organizza i tuoi contenuti con stile
            </p>
          </div>

          {/* Login card */}
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-xl">Accedi</CardTitle>
              <CardDescription>
                Inserisci le tue credenziali per continuare
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@esempio.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    className="bg-background/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="bg-background/50"
                  />
                </div>
                
                {error && (
                  <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg"
                  disabled={isLoading || !email || !password}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connessione...
                    </>
                  ) : (
                    'Accedi'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Features preview */}
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { label: 'Calendario', icon: '📅' },
              { label: 'Kanban', icon: '📋' },
              { label: 'Task', icon: '✅' },
            ].map((feature, i) => (
              <div 
                key={i}
                className="p-3 rounded-lg bg-card/50 border border-border/30"
              >
                <span className="text-xl mb-1 block">{feature.icon}</span>
                <span className="text-xs text-muted-foreground">{feature.label}</span>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-muted-foreground relative z-10">
        <p>Planner Editoriale per Content Creator</p>
      </footer>
    </div>
  );
}
