import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { useDreamStore } from '../stores/dreamStore';
import { DreamSchema, type Dream } from '../types';

export const DreamList: React.FC = () => {
  const { dreams } = useDreamStore();
  const [sortBy, setSortBy] = useState<'date' | 'title'>('date');
  const [filterTag, setFilterTag] = useState('');

  // Get unique tags across all dreams
  const allTags = Array.from(
    new Set(dreams.flatMap(dream => dream.tags || []))
  );

  // Filter and sort dreams
  const filteredAndSortedDreams = dreams
    .filter(dream => 
      !filterTag || dream.tags?.includes(filterTag)
    )
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      } else {
        return a.title.localeCompare(b.title);
      }
    });

  return (
    <div className="dream-list-container">
      <div className="controls">
        <div className="sort-control">
          <label>Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'title')}
          >
            <option value="date">Recent</option>
            <option value="title">Title</option>
          </select>
        </div>
        
        <div className="filter-control">
          <label>Filter by tag:</label>
          <select
            value={filterTag}
            onChange={(e) => setFilterTag(e.target.value)}
          >
            <option value="">All Dreams</option>
            {allTags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="dream-grid">
        <AnimatePresence>
          {filteredAndSortedDreams.map(dream => (
            <DreamCard key={dream.id} dream={dream} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

const DreamCard: React.FC<{ dream: Dream }> = ({ dream }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -5, boxShadow: "0 10px 25px rgba(157, 78, 221, 0.2)" }}
      className="dream-card"
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      data-astro-prefetch
    >
    <a href={`/journal/${dream.id}`}>
        <div className="card-date">
          {format(parseISO(dream.date), 'MMM d, yyyy')}
        </div>
        <h3 className="card-title">{dream.title}</h3>
        <p className="card-description">
          {dream.description.length > 120 
            ? `${dream.description.slice(0, 120)}...` 
            : dream.description}
        </p>
        {dream.emotionalState && (
          <div className={`emotion-badge ${dream.emotionalState}`}>
            {dream.emotionalState}
          </div>
        )}
        {dream.tags && dream.tags.length > 0 && (
          <div className="tags">
            {dream.tags.map(tag => (
              <span key={tag} className="tag">{tag}</span>
            ))}
          </div>
        )}
        
        <div className="card-glow"></div>
      </a>
    </motion.div>
  );
};