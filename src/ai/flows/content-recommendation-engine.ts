// src/ai/flows/content-recommendation-engine.ts
'use server';

/**
 * @fileOverview AI flow that recommends music and video content based on the user's detected mood.
 *
 * - recommendContent - A function that takes a mood as input and returns music and video recommendations.
 * - ContentRecommendationInput - The input type for the recommendContent function.
 * - ContentRecommendationOutput - The return type for the recommendContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ContentRecommendationInputSchema = z.object({
  mood: z
    .string()    
    .describe('The current mood of the user (e.g., happy, sad, excited, relaxed).'),
});
export type ContentRecommendationInput = z.infer<typeof ContentRecommendationInputSchema>;

const ContentRecommendationOutputSchema = z.object({
  musicRecommendation: z.string().describe('A music recommendation based on the mood.'),
  videoRecommendation: z.string().describe('A video recommendation based on the mood.'),
});
export type ContentRecommendationOutput = z.infer<typeof ContentRecommendationOutputSchema>;

export async function recommendContent(input: ContentRecommendationInput): Promise<ContentRecommendationOutput> {
  return recommendContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'contentRecommendationPrompt',
  input: {schema: ContentRecommendationInputSchema},
  output: {schema: ContentRecommendationOutputSchema},
  prompt: `You are an AI that recommends music and video content based on the user's mood.

  The user is currently feeling: {{{mood}}}

  Based on this mood, provide a single music recommendation and a single video recommendation that would be relevant and enjoyable for the user.
  Do not provide any additional information other than the music and video recommendations.
  Format: the response as a JSON object.
  `,
});

const recommendContentFlow = ai.defineFlow(
  {
    name: 'recommendContentFlow',
    inputSchema: ContentRecommendationInputSchema,
    outputSchema: ContentRecommendationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
