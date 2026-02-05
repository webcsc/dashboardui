import { Coffee, Bell, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function DashboardHeader() {
  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary">
            <Coffee className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold text-foreground">
              CSC Dashboard
            </h1>
            <p className="text-sm text-muted-foreground">
              La Coopérative du Café
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full text-[10px] text-white flex items-center justify-center">
              3
            </span>
          </Button>
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
            <span className="sr-only">Paramètres</span>
          </Button>
        </div>
      </div>
    </header>
  );
}



