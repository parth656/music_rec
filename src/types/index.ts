export interface AnalyzedMood {
  mood: string;
  confidence: number;
}

export interface AiContentRecommendations {
  musicRecommendation: string;
  videoRecommendation: string;
}

export interface UIMediaItem {
  id: string;
  type: 'music' | 'video';
  title: string;
  description?: string;
  thumbnailUrl: string;
  dataAiHint: string;
  feedback?: 'liked' | 'disliked';
}
