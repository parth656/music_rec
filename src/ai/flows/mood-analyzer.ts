
'use server';

/**
 * @fileOverview Mood analysis AI agent.
 *
 * - analyzeMood - A function that analyzes voice input to detect the user's current mood.
 * - MoodAnalyzerInput - The input type for the analyzeMood function.
 * - MoodAnalyzerOutput - The return type for the analyzeMood function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MoodAnalyzerInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "Audio data URI containing the user's voice input. It must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type MoodAnalyzerInput = z.infer<typeof MoodAnalyzerInputSchema>;

const MoodAnalyzerOutputSchema = z.object({
  mood: z
    .string()
    .describe(
      'The detected mood of the user.  Possible values include happy, sad, angry, excited, or neutral.'
    ),
  confidence: z
    .number()
    .describe('A numerical value between 0 and 1 indicating the confidence level of the mood detection.'),
});
export type MoodAnalyzerOutput = z.infer<typeof MoodAnalyzerOutputSchema>;

export async function analyzeMood(input: MoodAnalyzerInput): Promise<MoodAnalyzerOutput> {
  return analyzeMoodFlow(input);
}

const prompt = ai.definePrompt({
  name: 'moodAnalyzerPrompt',
  input: {schema: MoodAnalyzerInputSchema},
  output: {schema: MoodAnalyzerOutputSchema},
  prompt: `Analyze the user's voice input to detect their mood.

Voice Input: {{media url=audioDataUri}}

Determine the user's mood and provide a confidence level for the detection.
Possible moods: happy, sad, angry, excited, neutral.

Return the mood and confidence level in JSON format.`,
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
    ],
  },
});

const analyzeMoodFlow = ai.defineFlow(
  {
    name: 'analyzeMoodFlow',
    inputSchema: MoodAnalyzerInputSchema,
    outputSchema: MoodAnalyzerOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

