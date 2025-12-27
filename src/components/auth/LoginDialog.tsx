import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface LoginDialogProps {
  open: boolean;
  onLogin: (email: string, password: string) => boolean;
}

export const LoginDialog: React.FC<LoginDialogProps> = ({ open, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: 'Errore',
        description: 'Inserisci email e password',
        variant: 'destructive',
      });
      return;
    }

    const success = onLogin(email, password);
    if (success) {
      toast({
        title: 'Benvenuto!',
        description: 'Login effettuato con successo',
      });
    } else {
      toast({
        title: 'Errore',
        description: 'Credenziali non valide',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Accedi al Planner</DialogTitle>
          <DialogDescription>
            Inserisci le tue credenziali per accedere
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="email@esempio.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
            />
          </div>
          <Button type="submit" className="w-full">
            Accedi
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
