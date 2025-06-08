import Image from 'next/image';
import type { UIMediaItem } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Music, Film } from 'lucide-react';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: UIMediaItem | null;
}

export function PreviewModal({ isOpen, onClose, item }: PreviewModalProps) {
  if (!item) return null;

  const Icon = item.type === 'music' ? Music : Film;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px] bg-card border-border shadow-xl">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl text-primary flex items-center gap-2">
            <Icon /> Preview: {item.title}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground pt-2">
            {item.description || "Enjoy a sneak peek of this content."}
          </DialogDescription>
        </DialogHeader>
        <div className="my-4">
          <Image
            src={item.thumbnailUrl}
            alt={item.title}
            width={480}
            height={270}
            className="rounded-lg object-cover aspect-video mx-auto shadow-md"
            data-ai-hint={item.dataAiHint}
          />
        </div>
        <div className="text-center text-sm text-muted-foreground py-2">
          Full playback integration with streaming services is coming soon!
        </div>
        <div className="flex justify-end">
          <Button onClick={onClose} variant="outline">Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
