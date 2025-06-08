import type { AnalyzedMood } from '@/types';
import { Smile, Frown, Angry, Sparkles, Meh, HelpCircle } from 'lucide-react';

interface MoodDisplayProps {
  moodAnalysis: AnalyzedMood | null;
}

const MoodIcon = ({ mood }: { mood: string }) => {
  const lowerMood = mood.toLowerCase();
  if (lowerMood.includes('happy')) return <Smile size={48} className="text-green-400" />;
  if (lowerMood.includes('sad')) return <Frown size={48} className="text-blue-400" />;
  if (lowerMood.includes('angry')) return <Angry size={48} className="text-red-400" />;
  if (lowerMood.includes('excited')) return <Sparkles size={48} className="text-yellow-400" />;
  if (lowerMood.includes('neutral')) return <Meh size={48} className="text-gray-400" />;
  return <HelpCircle size={48} className="text-gray-500" />;
};

export function MoodDisplay({ moodAnalysis }: MoodDisplayProps) {
  if (!moodAnalysis) return null;

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-card rounded-lg shadow-lg animate-fade-in">
      <MoodIcon mood={moodAnalysis.mood} />
      <h2 className="text-3xl font-headline capitalize">{moodAnalysis.mood}</h2>
      <p className="text-sm text-muted-foreground">
        Confidence: {(moodAnalysis.confidence * 100).toFixed(0)}%
      </p>
    </div>
  );
}
