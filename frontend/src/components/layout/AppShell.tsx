import type { ReactNode } from 'react';
import { CheckCheck } from 'lucide-react';
import { ThemeToggle } from '../ui/ThemeToggle';

interface AppShellProps {
  isDark: boolean;
  onToggleTheme: () => void;
  children: ReactNode;
}

export function AppShell({ isDark, onToggleTheme, children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-app-gradient">
      <header className="border-b border-divider/70 bg-background/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-soft">
              <CheckCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-teal">BrightCone</p>
              <h1 className="text-lg font-semibold text-foreground">Todo Workspace</h1>
            </div>
          </div>
          <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
