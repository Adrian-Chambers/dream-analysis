// src/utils/nlpUtils.ts
import nlp from 'compromise';
import sentences from 'compromise-sentences';
nlp.extend(sentences);
import { OpenAI } from 'openai';

// Define the getOpenAIInstance function at the top of the file
const getOpenAIInstance = () => {
  const apiKey = import.meta.env.PUBLIC_OPENAI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true
  });
};

// Fallback list of common dream symbols
const COMMON_DREAM_SYMBOLS = [
  'water', 'flying', 'falling', 'teeth', 'chase', 'snake', 'house', 
  'school', 'exam', 'naked', 'death', 'money', 'baby', 'animal',
  'car', 'train', 'wedding', 'fire', 'ocean', 'mountain', 'forest',
  'door', 'mirror', 'ghost', 'celebrity'
];

export async function extractDreamThemes(text: string): Promise<Record<string, number>> {
  try {
    if (!import.meta.env.PUBLIC_OPENAI_API_KEY || text.length < 50) {
      // Fall back to basic NLP if no API key or text is too short
      return basicThemeExtraction(text);
    }
    
    const openai = getOpenAIInstance();
    if (!openai) {
      return basicThemeExtraction(text);
    }
    
    // Use OpenAI for advanced theme extraction
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `Extract the main themes and symbols from this dream. 
          Return the result as a JSON object with theme names as keys and their frequency/importance (1-5) as values. DO NOT INCLUDE ANY EXPLANATION TEXT IN YOUR RESPONSE.
          Example: {"water": 3, "flying": 2}. Focus on psychological themes, emotions, and dream symbols.`
        },
        {
          role: "user",
          content: text
        }
      ],
      response_format: { type: "json_object" }
    });
    
    const result = response.choices[0]?.message?.content;
    if (result) {
      try {
        const parsed = JSON.parse(result) as Record<string, number>;
        if (Object.keys(parsed).length === 0) {
          return basicThemeExtraction(text);
        }
        return parsed;
      } catch (e) {
        console.error("Failed to parse AI theme extraction:", e);
      }
    }
    
    // Fall back to basic extraction if AI fails
    return basicThemeExtraction(text);
  } catch (error) {
    console.error("Error with AI theme extraction:", error);
    return basicThemeExtraction(text);
  }
}

function basicThemeExtraction(text: string): Record<string, number> {
  const doc = nlp(text);
  const themes: Record<string, number> = {};
  
  // Look for common symbols
  COMMON_DREAM_SYMBOLS.forEach(symbol => {
    const matches = doc.match(symbol).text();
    if (matches) {
      const count = (matches.match(new RegExp(symbol, 'gi')) || []).length;
      if (count > 0) {
        themes[symbol] = count;
      }
    }
  });
  
  // Extract main nouns as potential themes
  const nouns = doc.nouns().out('array');
  nouns.forEach((noun: string) => {
    const normalized = noun.toLowerCase().trim();
    if (normalized.length > 3 && !COMMON_DREAM_SYMBOLS.includes(normalized)) {
      themes[normalized] = (themes[normalized] || 0) + 1;
    }
  });
  
  // Filter out any themes that only appear once
  return Object.fromEntries(
    Object.entries(themes).filter(([_, count]) => count > 1)
  );
}

export function analyzeEmotions(text: string): Record<string, number> {
  const doc = nlp(text);
  const emotions = {
    'positive': 0,
    'negative': 0,
    'anxiety': 0,
    'fear': 0,
    'joy': 0,
    'peace': 0,
    'confusion': 0
  };
  
  // Look for emotional indicators
  const emotionalWords = {
    'positive': ['happy', 'excited', 'joy', 'pleasant', 'calm', 'peaceful'],
    'negative': ['sad', 'upset', 'angry', 'disappointed', 'frustrated'],
    'anxiety': ['anxious', 'worried', 'stress', 'panic', 'nervous'],
    'fear': ['afraid', 'scared', 'terrified', 'horror', 'frightened'],
    'joy': ['happy', 'joyful', 'pleased', 'delighted', 'excited'],
    'peace': ['calm', 'peaceful', 'serene', 'tranquil', 'relaxed'],
    'confusion': ['confused', 'disoriented', 'lost', 'puzzled', 'baffled']
  };
  
  Object.entries(emotionalWords).forEach(([emotion, words]) => {
    words.forEach(word => {
      const matches = doc.match(word).text();
      if (matches) {
        const count = (matches.match(new RegExp(word, 'gi')) || []).length;
        emotions[emotion as keyof typeof emotions] += count;
      }
    });
  });
  
  return emotions;
}

export async function generateThemeInsights(
  themes: [string, number][]
): Promise<Record<string, string>> {
  const openai = getOpenAIInstance();
  const insights: Record<string, string> = {};
  
  if (!openai || themes.length === 0) {
    return themes.reduce((acc, [theme, _]) => {
      acc[theme] = `This symbol might represent an important aspect of your subconscious mind.`;
      return acc;
    }, {} as Record<string, string>);
  }
  
  try {
    const topThemes = themes.slice(0, 3);
    const themesText = topThemes.map(([theme, count]) => 
      `"${theme}" (appears ${count} times)`
    ).join(", ");
    
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a dream analyst who provides brief but insightful interpretations of dream symbols. 
          For each symbol, provide a 1-2 sentence psychological or symbolic interpretation.
          Return your response as a JSON object where keys are the symbols and values are their interpretations.`
        },
        {
          role: "user",
          content: `Provide brief interpretations for these recurring dream symbols: ${themesText}. 
          Return the interpretations as a JSON object.`
        }
      ],
      response_format: { type: "json_object" }
    });
    
    const result = response.choices[0]?.message?.content;
    if (result) {
      try {
        const parsedInsights = JSON.parse(result) as Record<string, string>;
        
        // Map the insights to our theme keys
        topThemes.forEach(([theme, _]) => {
          const cleanTheme = theme.replace(/"/g, '');
          // Try different ways to match the theme
          const themeKey = Object.keys(parsedInsights).find(
            k => k.toLowerCase().includes(cleanTheme.toLowerCase()) || 
                 cleanTheme.toLowerCase().includes(k.toLowerCase())
          );
          
          if (themeKey && parsedInsights[themeKey]) {
            insights[theme] = parsedInsights[themeKey];
          } else {
            insights[theme] = `This symbol might represent an important aspect of your subconscious mind.`;
          }
        });
      } catch (e) {
        console.error("Failed to parse AI insights:", e);
      }
    }
    
    // Add basic insights for any remaining themes
    themes.forEach(([theme, _]) => {
      if (!insights[theme]) {
        insights[theme] = `This symbol might represent an important aspect of your subconscious mind.`;
      }
    });
    
    return insights;
  } catch (error) {
    console.error("Error generating theme insights:", error);
    
    return themes.reduce((acc, [theme, _]) => {
      acc[theme] = `This symbol might represent an important aspect of your subconscious mind.`;
      return acc;
    }, {} as Record<string, string>);
  }
}

export async function generateEmotionalInsights(
  emotionTrends: Record<string, number>
): Promise<string> {
  const openai = getOpenAIInstance();
  
  if (!openai) {
    return "Your dreams show a mix of different emotions. Pay attention to how these emotions relate to your waking life.";
  }
  
  try {
    // Format the emotion data
    const emotionData = Object.entries(emotionTrends)
      .map(([emotion, value]) => `${emotion}: ${value.toFixed(1)}`)
      .join(", ");
    
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a dream analyst specializing in emotional patterns. Provide a brief but insightful interpretation 
          of the emotional trends in someone's dreams. Be thoughtful but concise (2-3 sentences).`
        },
        {
          role: "user",
          content: `Based on these emotional patterns in my dreams, what insights can you provide? Emotions (scale 0-5): ${emotionData}`
        }
      ]
    });
    
    const result = response.choices[0]?.message?.content;
    if (result) {
      return result;
    }
    
    return "Your dreams show a mix of different emotions. Pay attention to how these emotions relate to your waking life.";
  } catch (error) {
    console.error("Error generating emotional insights:", error);
    return "Your dreams show a mix of different emotions. Pay attention to how these emotions relate to your waking life.";
  }
}