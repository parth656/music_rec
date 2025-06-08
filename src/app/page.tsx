
'use client';

import { useState, useEffect, useCallback } from 'react';
import { analyzeMood } from '@/ai/flows/mood-analyzer';
import { recommendContent } from '@/ai/flows/content-recommendation-engine';
import { recordAudio } from '@/lib/audio';
import type { AnalyzedMood, UIMediaItem, AiContentRecommendations } from '@/types';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { MoodDisplay } from '@/components/MoodDisplay';
import { ContentCard } from '@/components/ContentCard';
import { QueueDisplay } from '@/components/QueueDisplay';
import { PreviewModal } from '@/components/PreviewModal';
import { useToast } from "@/hooks/use-toast";
import { Mic, Zap, Music, Video, AlertTriangle, RefreshCw } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function HomePage() {
  const [isDetectingMood, setIsDetectingMood] = useState(false);
  const [moodAnalysis, setMoodAnalysis] = useState<AnalyzedMood | null>(null);
  const [isFetchingRecommendations, setIsFetchingRecommendations] = useState(false);
  const [recommendations, setRecommendations] = useState<UIMediaItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const [queue, setQueue] = useState<UIMediaItem[]>([]);
  const [previewItem, setPreviewItem] = useState<UIMediaItem | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const recordingDuration = 5; // 5 seconds

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isDetectingMood && recordingSeconds < recordingDuration) {
      timer = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } else if (recordingSeconds >= recordingDuration && isDetectingMood) {
      // This case might be handled by recordAudio resolving, but good for UI
      // setIsDetectingMood(false); 
      // setRecordingSeconds(0);
    }
    return () => clearInterval(timer);
  }, [isDetectingMood, recordingSeconds]);


  const handleDetectMood = async () => {
    setError(null);
    setMoodAnalysis(null);
    setRecommendations([]);
    setIsDetectingMood(true);
    setRecordingSeconds(0);

    try {
      const audioDataUri = await recordAudio(recordingDuration * 1000);
      // Recording state is handled by recordAudio promise resolving/rejecting
      // setIsDetectingMood(false); // Handled by finally or error
      setRecordingSeconds(0); // Reset timer display
      setIsFetchingRecommendations(true);

      const moodResult = await analyzeMood({ audioDataUri });
      setMoodAnalysis(moodResult);

      if (moodResult && moodResult.mood) {
        const contentResult: AiContentRecommendations = await recommendContent({ mood: moodResult.mood });
        const newRecommendations: UIMediaItem[] = [];
        if (contentResult.musicRecommendation) {
          newRecommendations.push({
            id: `music-${Date.now()}`,
            type: 'music',
            title: contentResult.musicRecommendation,
            description: `A music track fitting a '${moodResult.mood}' mood.`,
            thumbnailUrl: `https://placehold.co/400x225.png`,
            dataAiHint: 'music album',
          });
        }
        if (contentResult.videoRecommendation) {
          newRecommendations.push({
            id: `video-${Date.now()}`,
            type: 'video',
            title: contentResult.videoRecommendation,
            description: `A video fitting a '${moodResult.mood}' mood.`,
            thumbnailUrl: `https://placehold.co/400x225.png`,
            dataAiHint: 'video scene',
          });
        }
        setRecommendations(newRecommendations);
      } else {
        setError("Could not determine mood from audio.");
        toast({ title: "Mood Analysis Failed", description: "Could not determine mood from audio.", variant: "destructive" });
      }
    } catch (err: any) {
      console.error(err);
      const errorMessage = typeof err === 'string' ? err : (err.message || "An unknown error occurred during mood detection.");
      setError(errorMessage);
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    } finally {
      setIsDetectingMood(false); // Ensure this is always reset
      setRecordingSeconds(0);   // And this
      setIsFetchingRecommendations(false);
    }
  };

  const handleAddToQueue = useCallback((item: UIMediaItem) => {
    if (!queue.find(qItem => qItem.id === item.id)) {
      setQueue(prevQueue => [...prevQueue, item]);
      toast({ title: "Added to Queue", description: `"${item.title}" has been added.` });
    } else {
      toast({ title: "Already Queued", description: `"${item.title}" is already in your queue.`, variant: "default" });
    }
  }, [queue, toast]);

  const handleRemoveFromQueue = useCallback((itemId: string) => {
    const item = queue.find(i => i.id === itemId);
    setQueue(prevQueue => prevQueue.filter(i => i.id !== itemId));
    if (item) {
      toast({ title: "Removed from Queue", description: `"${item.title}" removed.` });
    }
  }, [queue, toast]);

  const handlePreview = useCallback((item: UIMediaItem) => {
    setPreviewItem(item);
    setIsPreviewOpen(true);
  }, []);

  const handleClosePreview = useCallback(() => {
    setIsPreviewOpen(false);
    setPreviewItem(null);
  }, []);

  const handleFeedback = useCallback((itemId: string, feedback: 'liked' | 'disliked') => {
    setRecommendations(prev => prev.map(rec => rec.id === itemId ? { ...rec, feedback } : rec));
    const item = recommendations.find(r => r.id === itemId);
    if (item) {
     toast({ title: "Feedback Received", description: `You ${feedback} "${item.title}".` });
    }
  }, [recommendations, toast]);

  const resetState = () => {
    setIsDetectingMood(false);
    setMoodAnalysis(null);
    setIsFetchingRecommendations(false);
    setRecommendations([]);
    setError(null);
    setQueue([]);
    setPreviewItem(null);
    setIsPreviewOpen(false);
    setRecordingSeconds(0);
    toast({title: "App Reset", description: "The application state has been reset."});
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8 space-y-8">
        <section id="mood-detection" className="text-center space-y-6 p-6 bg-card rounded-xl shadow-xl">
          <h2 className="text-3xl font-headline text-primary">Discover Your Vibe</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Let VibeSync analyze your voice to understand your current mood and recommend personalized music and video content.
            Press the button below and speak for {recordingDuration} seconds.
          </p>
          <Button
            onClick={handleDetectMood}
            disabled={isDetectingMood || isFetchingRecommendations}
            size="lg"
            className="bg-accent hover:bg-accent/90 text-accent-foreground px-8 py-6 text-lg rounded-full shadow-lg transition-transform hover:scale-105"
            aria-live="polite"
          >
            {isDetectingMood ? (
              <div className="flex items-center gap-2">
                <LoadingSpinner size={24} className="text-accent-foreground" />
                <span>Recording ({recordingDuration - recordingSeconds}s)...</span>
              </div>
            ) : isFetchingRecommendations ? (
              <div className="flex items-center gap-2">
                <LoadingSpinner size={24} className="text-accent-foreground" />
                <span>Analyzing Vibe...</span>
              </div>
            ) : (
              <>
                <Mic className="mr-2" /> Start Vibe Detection
              </>
            )}
          </Button>
          {isDetectingMood && (
             <div className="w-full bg-muted rounded-full h-2.5 mt-2" aria-hidden="true">
                <div className="bg-primary h-2.5 rounded-full transition-all duration-1000 ease-linear" style={{ width: `${(recordingSeconds / recordingDuration) * 100}%` }}></div>
            </div>
          )}
        </section>

        {error && (
          <Alert variant="destructive" className="animate-fade-in">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {moodAnalysis && !isFetchingRecommendations && (
          <section id="mood-result" aria-labelledby="mood-heading" className="animate-fade-in">
            <MoodDisplay moodAnalysis={moodAnalysis} />
          </section>
        )}

        {isFetchingRecommendations && !moodAnalysis && !isDetectingMood && (
           <div className="flex flex-col items-center justify-center p-10">
             <LoadingSpinner size={64} text="Fetching your personalized recommendations..." />
           </div>
        )}

        {recommendations.length > 0 && !isFetchingRecommendations && (
          <section id="recommendations" aria-labelledby="recommendations-heading" className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
              <h2 id="recommendations-heading" className="text-3xl font-headline text-primary flex items-center gap-2">
                <Zap /> Your Vibe Recommendations
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recommendations.map(item => (
                <ContentCard
                  key={item.id}
                  item={item}
                  onPreview={handlePreview}
                  onAddToQueue={handleAddToQueue}
                  onFeedback={handleFeedback}
                  isQueued={queue.some(qItem => qItem.id === item.id)}
                />
              ))}
            </div>
          </section>
        )}

        { !isFetchingRecommendations && !moodAnalysis && recommendations.length === 0 && !error && (
          <div className="text-center py-8 text-muted-foreground">
            <p>Press "Start Vibe Detection" to get started!</p>
          </div>
        )}

        <Separator className="my-8" />

        <section id="queue" aria-labelledby="queue-heading" className="space-y-6">
           <QueueDisplay
            queue={queue}
            onRemoveFromQueue={handleRemoveFromQueue}
            onPlayFromQueue={handlePreview}
          />
        </section>

        <div className="text-center py-4">
            <Button onClick={resetState} variant="outline">
                <RefreshCw className="mr-2" /> Reset App
            </Button>
        </div>

      </main>
      <footer className="py-6 px-4 md:px-8 border-t border-border/50 text-center">
        <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} VibeSync. Your mood, your media.</p>
      </footer>
      {previewItem && (
        <PreviewModal
          isOpen={isPreviewOpen}
          onClose={handleClosePreview}
          item={previewItem}
        />
      )}
    </div>
  );
}

    