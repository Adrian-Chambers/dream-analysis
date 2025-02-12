import { useState } from 'react';
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // For client-side usage (consider server API route for production)
});

export function useAIInterpretation() {
  const [interpretation, setInterpretation] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function interpretDream(description: string): Promise<string | null> {
    if (!import.meta.env.PUBLIC_OPENAI_API_KEY) {
      console.warn("OpenAI API key not found. Using mock interpretation.");
      return mockInterpretation(description);
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a dream analyst specialized in psychological symbolism, Jungian archetypes, and dream folklore. Provide thoughtful interpretations that include: 1) Symbolic analysis, 2) Emotional/psychological insights, 3) Potential meanings or advice, and 4) Relevant mythological or cultural connections if applicable."
          },
          {
            role: "user",
            content: `Interpret this dream: ${description}`
          }
        ],
      });
      
      const result = response.choices[0]?.message?.content || "Could not generate interpretation";
      setInterpretation(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error("Error interpreting dream:", errorMessage);
      
      // Fall back to mock interpretation if API fails
      return mockInterpretation(description);
    } finally {
      setIsLoading(false);
    }
  }
  
  // Fallback mock interpretation when API key is missing or API call fails
  function mockInterpretation(description: string): string {
    const themes = [
      "This dream might reflect your subconscious mind processing recent events",
      "There could be symbols of transformation and change in this dream",
      "Your dream suggests themes of exploration and discovery",
      "This dream may represent unresolved emotions or desires",
    ];
    const advice = [
      "Consider journaling about how this dream made you feel",
      "Reflect on any recurring patterns in your dreams",
      "This might be a good time to address any lingering concerns in your waking life",
    ];
    
    return `
Dream Interpretation:

${themes[Math.floor(Math.random() * themes.length)]}. Dreams are highly personal, and the symbols that appear often connect to our waking experiences and emotions.

${advice[Math.floor(Math.random() * advice.length)]}. Remember that you are the ultimate authority on what your dreams mean to you.
    `;
  }

  return { interpretation, interpretDream, isLoading, error };
}