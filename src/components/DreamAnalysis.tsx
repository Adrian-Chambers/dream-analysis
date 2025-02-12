import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useDreamAnalysis } from '../hooks/useAnalysis';
import { ThemesChart } from './Visualizations/ThemesChart';
import { EmotionsRadarChart } from './Visualizations/EmotionsRadarChart';
import { TimelineChart } from './Visualizations/TimelineChart';
import { useDreamStore } from '../stores/dreamStore';
import { format, subMonths } from 'date-fns';

export const DreamAnalysis: React.FC = () => {
  const { dreams } = useDreamStore();
  const [isLoadingComplete, setIsLoadingComplete] = useState(false);

  // Get earliest and latest dream dates for range limits
  const sortedDates = [...dreams].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const earliestDate = sortedDates.length > 0 ? sortedDates[0].date : format(subMonths(new Date(), 6), 'yyyy-MM-dd');
  const latestDate = sortedDates.length > 0 ? sortedDates[sortedDates.length - 1].date : format(new Date(), 'yyyy-MM-dd');

  // Date range state
  const [startDate, setStartDate] = useState(earliestDate);
  const [endDate, setEndDate] = useState(latestDate);

  const analysis = useDreamAnalysis(dreams, startDate, endDate);
  const [activeTab, setActiveTab] = useState<'themes' | 'emotions' | 'timeline'>('themes');

  useEffect(() => {
    // Only set loading complete when we have dreams and analysis
    if (dreams.length >= 3 && analysis) {
      setIsLoadingComplete(true);
    }
  }, [dreams.length, analysis]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.name === 'startDate') {
      setStartDate(e.target.value);
    } else if (e.target.name === 'endDate') {
      setEndDate(e.target.value);
    }
    // Reset loading state when dates change
    setIsLoadingComplete(false);
  };

  // Check if there's not enough dreams
  if (dreams.length < 3) {
    return (
      <div className="analysis-placeholder">
        <h2>Not Enough Dreams Yet</h2>
        <p>
          Record at least 3 dreams to unlock pattern analysis and visualizations.
        </p>
        <div className="dream-icon">💤</div>
      </div>
    );
  }

   // Show loading until we have both enough dreams AND analysis is complete
   if (!isLoadingComplete) {
    return (
      <div className="analysis-loading">
        <div className="loading-spinner"></div>
        <p>Analyzing your dreams...</p>
        <p className="loading-subtext">This may take a few moments as we process your dream patterns</p>
      </div>
    );
  }

  const { recurringThemes, emotionTrends, timeline, themeInsights } = analysis;


  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="analysis-container"
    >
      <div className="analysis-header">
        <h2>Dream Pattern Analysis</h2>
        <p>Discover recurring themes and emotional patterns in your dreams</p>
      </div>

      <div className="date-range-selector">
        <div className="date-input-group">
          <label htmlFor="startDate">From:</label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            value={startDate}
            onChange={handleDateChange}
            min={earliestDate}
            max={endDate}
          />
        </div>
        <div className="date-input-group">
          <label htmlFor="endDate">To:</label>
          <input
            type="date"
            id="endDate"
            name="endDate"
            value={endDate}
            onChange={handleDateChange}
            min={startDate}
            max={latestDate}
          />
        </div>
      </div>

      <div className="analysis-tabs">
        <button
          className={activeTab === 'themes' ? 'active' : ''}
          onClick={() => setActiveTab('themes')}
        >
          Themes & Symbols
        </button>
        <button
          className={activeTab === 'emotions' ? 'active' : ''}
          onClick={() => setActiveTab('emotions')}
        >
          Emotional Patterns
        </button>
        <button
          className={activeTab === 'timeline' ? 'active' : ''}
          onClick={() => setActiveTab('timeline')}
        >
          Dream Timeline
        </button>
      </div>

      <div className="analysis-content">
      {activeTab === 'themes' && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <ThemesChart themes={recurringThemes} />
          <div className="insight-box">
            <h3>Key Insights</h3>
            <ul>
              {recurringThemes.slice(0, 3).map(([theme, count]) => (
                <li key={theme}>
                  <strong>{theme}</strong> appears in your dreams {count} times.
                  <p className="theme-insight">
                    {themeInsights[theme] || "This might represent an important symbol in your subconscious."}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      )}

      {activeTab === 'emotions' && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <EmotionsRadarChart emotions={emotionTrends} />
          <div className="insight-box">
            <h3>Emotional Insights</h3>
            <p className="emotion-highlight">
              Your dreams show stronger tendencies toward{' '}
              {Object.entries(emotionTrends)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 2)
                .map(([emotion]) => emotion)
                .join(' and ')}.
            </p>
            <p className="emotion-insight">
              {analysis.emotionalInsight}
            </p>
          </div>
        </motion.div>
      )}

        {activeTab === 'timeline' && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <TimelineChart data={timeline} />
            <div className="insight-box">
              <h3>Dream Frequency</h3>
              <p>
                {timeline.length > 0
                  ? `You recorded the most dreams in ${
                      timeline.reduce((max, current) => 
                        current.count > max.count ? current : max
                      ).month
                    }. Consider what was happening in your life during this period.`
                  : 'Start recording more dreams to see frequency patterns.'}
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};