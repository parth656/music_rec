import type { UIMediaItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Music, Film, X, ListMusic } from 'lucide-react';
import Image from 'next/image';

interface QueueDisplayProps {
  queue: UIMediaItem[];
  onRemoveFromQueue: (itemId: string) => void;
  onPlayFromQueue: (item: UIMediaItem) => void; // For MVP, this might just be preview
}

export function QueueDisplay({ queue, onRemoveFromQueue, onPlayFromQueue }: QueueDisplayProps) {
  if (queue.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <ListMusic size={48} className="mx-auto mb-4" />
        <p>Your queue is empty.</p>
        <p>Add some recommendations to get started!</p>
      </div>
    );
  }

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center gap-2">
          <ListMusic className="text-primary" /> Your Vibe Queue
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {queue.map((item, index) => (
            <li
              key={item.id}
              className="flex items-center justify-between p-3 bg-card/50 rounded-md shadow-sm hover:bg-accent/10 transition-colors"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <Image 
                  src={item.thumbnailUrl} 
                  alt={item.title} 
                  width={40} 
                  height={40} 
                  className="rounded object-cover aspect-square"
                  data-ai-hint={item.dataAiHint}
                />
                <div className="overflow-hidden">
                  <p className="font-semibold truncate" title={item.title}>
                    {index + 1}. {item.title}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize flex items-center gap-1">
                    {item.type === 'music' ? <Music size={14} /> : <Film size={14} />}
                    {item.type}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button variant="ghost" size="sm" onClick={() => onPlayFromQueue(item)} aria-label={`Play ${item.title}`}>
                  Play
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive-foreground hover:bg-destructive/90"
                  onClick={() => onRemoveFromQueue(item.id)}
                  aria-label={`Remove ${item.title} from queue`}
                >
                  <X size={18} />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
