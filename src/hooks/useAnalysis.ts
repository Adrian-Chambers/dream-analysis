import { useEffect, useMemo, useState } from 'react';
import { type Dream } from '../types';
import { extractDreamThemes, analyzeEmotions, generateThemeInsights, generateEmotionalInsights } from '../utils/nlpUtils';
import { format, parseISO, subMonths, isWithinInterval } from 'date-fns';

//In src/hooks/useAnalysis.ts
export function useDreamAnalysis(dreams: Dream[], startDate?: string, endDate?: string) {
  const [analysis, setAnalysis] = useState<any>(null);
  
  useEffect(() => {
    async function runAnalysis() {
      if (dreams.length < 3) {
        setAnalysis(null);
        return;
      }

      let filteredDreams = dreams;
      if (startDate && endDate) {
        const start = parseISO(startDate);
        const end = parseISO(endDate);
        // Add one day to end date to include the end date itself
        end.setDate(end.getDate() + 1);
        
        filteredDreams = dreams.filter(dream => {
          const dreamDate = parseISO(dream.date);
          return isWithinInterval(dreamDate, { start, end });
        });
        
        // If filtered dreams are less than 3, return null
        if (filteredDreams.length < 3) {
          setAnalysis(null);
          return;
        }
      }
      
      // Recurring themes analysis
      const allThemes: Record<string, number> = {};
      const allEmotions: Record<string, number[]> = {
        'positive': [],
        'negative': [],
        'anxiety': [],
        'fear': [],
        'joy': [],
        'peace': [],
        'confusion': []
      };
      
      // Time-based data for timeline visualization
      const now = new Date();
      const sixMonthsAgo = subMonths(now, 6);
      const monthlyDreamCount: Record<string, number> = {};
      
      // Process each dream
      for (const dream of filteredDreams) {
        // Theme extraction
        const themes = await extractDreamThemes(dream.description);
        Object.entries(themes).forEach(([theme, count]) => {
          allThemes[theme] = (allThemes[theme] || 0) + count;
        });
        
        // Emotional analysis
        const emotions = analyzeEmotions(dream.description);
        Object.entries(emotions).forEach(([emotion, count]) => {
          if (emotion in allEmotions) {
            allEmotions[emotion as keyof typeof allEmotions].push(count);
          }
        });
        
        // Timeline analysis
        const dreamDate = parseISO(dream.date);
        if (isWithinInterval(dreamDate, { start: sixMonthsAgo, end: now })) {
          const monthYear = format(dreamDate, 'MMM yyyy');
          monthlyDreamCount[monthYear] = (monthlyDreamCount[monthYear] || 0) + 1;
        }
      }
      
      // Sort themes by frequency
      const recurringThemes = Object.entries(allThemes)
        .filter(([_, count]) => count > 2)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

      // Get AI-generated insights for themes
      const themeInsights = await generateThemeInsights(recurringThemes);
      
      // Calculate average emotional intensity
      const emotionTrends = Object.fromEntries(
        Object.entries(allEmotions).map(([emotion, counts]) => {
          const avg = counts.length ? counts.reduce((sum, count) => sum + count, 0) / counts.length : 0;
          return [emotion, avg];
        })
      );

       // Get emotional insight
        let emotionalInsight = "Your dreams show a mix of different emotions.";
        try {
          emotionalInsight = await generateEmotionalInsights(emotionTrends);
        } catch (e) {
          console.error("Error generating emotional insight:", e);
        }
      
      // Format timeline data for visualization
      const timeline = Object.entries(monthlyDreamCount)
        .map(([month, count]) => ({ month, count }))
        .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());
      
      setAnalysis({
        recurringThemes,
        emotionTrends,
        timeline,
        themeInsights,
        emotionalInsight
      });
    }
    
    runAnalysis();
  }, [dreams, startDate, endDate]);
  
  return analysis;
}