import { Music2 } from 'lucide-react';

export function Header() {
  return (
    <header className="py-6 px-4 md:px-8 border-b border-border/50 shadow-md">
      <div className="container mx-auto flex items-center gap-3">
        <Music2 size={36} className="text-primary" />
        <h1 className="text-4xl font-headline text-primary">VibeSync</h1>
      </div>
    </header>
  );
}
