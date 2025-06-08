import Image from 'next/image';
import type { UIMediaItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Music, Film, ThumbsUp, ThumbsDown, ListPlus, Eye } from 'lucide-react';

interface ContentCardProps {
  item: UIMediaItem;
  onPreview: (item: UIMediaItem) => void;
  onAddToQueue: (item: UIMediaItem) => void;
  onFeedback: (itemId: string, feedback: 'liked' | 'disliked') => void;
  isQueued: boolean;
}

export function ContentCard({ item, onPreview, onAddToQueue, onFeedback, isQueued }: ContentCardProps) {
  const Icon = item.type === 'music' ? Music : Film;

  return (
    <Card className="w-full max-w-sm overflow-hidden shadow-xl hover:shadow-primary/30 transition-shadow duration-300">
      <CardHeader className="p-0 relative">
        <Image
          src={item.thumbnailUrl}
          alt={item.title}
          width={400}
          height={225}
          className="aspect-video object-cover"
          data-ai-hint={item.dataAiHint}
        />
        <div className="absolute top-2 right-2 bg-background/70 p-1.5 rounded-full">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <CardTitle className="font-headline text-xl mb-2 truncate" title={item.title}>{item.title}</CardTitle>
        {item.description && <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>}
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between gap-2 p-4 pt-0">
        <div className="flex gap-2">
          <Button
            variant={item.feedback === 'liked' ? "default" : "outline"}
            size="icon"
            onClick={() => onFeedback(item.id, 'liked')}
            aria-label="Like"
            className={item.feedback === 'liked' ? "bg-primary hover:bg-primary/90" : ""}
          >
            <ThumbsUp />
          </Button>
          <Button
            variant={item.feedback === 'disliked' ? "destructive" : "outline"}
            size="icon"
            onClick={() => onFeedback(item.id, 'disliked')}
            aria-label="Dislike"
          >
            <ThumbsDown />
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => onPreview(item)} aria-label="Preview">
            <Eye className="mr-2 h-4 w-4" /> Preview
          </Button>
          <Button onClick={() => onAddToQueue(item)} disabled={isQueued} aria-label="Add to Queue">
            <ListPlus className="mr-2 h-4 w-4" /> {isQueued ? 'Queued' : 'Queue'}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
