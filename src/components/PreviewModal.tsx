import Image from 'next/image';
import { useEffect, useRef } from 'react';
import type { UIMediaItem } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Music, Film } from 'lucide-react';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: UIMediaItem | null;
}

const PLACEHOLDER_VIDEO_URL = 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
const PLACEHOLDER_AUDIO_URL = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

export function PreviewModal({ isOpen, onClose, item }: PreviewModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (!isOpen) {
      videoRef.current?.pause();
      audioRef.current?.pause();
    }
  }, [isOpen]);

  useEffect(() => {
    // When item changes, pause and reset previous media
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      videoRef.current.load(); // May not be strictly necessary if src changes, but good for safety
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.load();
    }
  }, [item]);


  if (!item) return null;

  const Icon = item.type === 'music' ? Music : Film;
  const playbackUrl = item.playbackUrl || (item.type === 'video' ? PLACEHOLDER_VIDEO_URL : PLACEHOLDER_AUDIO_URL);

  return (
    <Dialog open={isOpen} onOpenChange={(openStatus) => { if (!openStatus) onClose(); }}>
      <DialogContent className="sm:max-w-xl bg-card border-border shadow-xl">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl text-primary flex items-center gap-2">
            <Icon /> Preview: {item.title}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground pt-2">
            {item.description || "Enjoy your selected content."}
          </DialogDescription>
        </DialogHeader>
        <div className="my-4">
          {item.type === 'video' ? (
            <video
              ref={videoRef}
              controls
              src={playbackUrl}
              poster={item.thumbnailUrl}
              className="w-full rounded-lg aspect-video mx-auto shadow-md bg-black"
              preload="metadata"
            >
              Your browser does not support the video tag.
            </video>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <Image
                src={item.thumbnailUrl}
                alt={item.title}
                width={300}
                height={300}
                className="rounded-lg object-cover aspect-square mx-auto shadow-md"
                data-ai-hint={item.dataAiHint || 'album art'}
              />
              <audio
                ref={audioRef}
                controls
                src={playbackUrl}
                className="w-full"
                preload="metadata"
              >
                Your browser does not support the audio element.
              </audio>
            </div>
          )}
        </div>
        <div className="flex justify-end">
          <Button onClick={onClose} variant="outline">Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
