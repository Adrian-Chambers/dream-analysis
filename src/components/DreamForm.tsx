import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { useDreamStore } from '../stores/dreamStore';
import { useAIInterpretation } from '../hooks/useAIInterpretation';
import { motion } from 'framer-motion';


type FormData = {
  title: string;
  date: string;
  description: string;
  tags: string;
  emotionalState: string;
};

export const DreamForm: React.FC = () => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>();
  const { addDream } = useDreamStore();
  const { interpretDream, isLoading } = useAIInterpretation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    const tagArray = data.tags ? data.tags.split(',').map(tag => tag.trim()) : [];
    
    try {
      // Wait for the interpretation to complete
      const interpretation = await interpretDream(data.description);
      
      addDream({
        title: data.title,
        date: data.date,
        description: data.description,
        tags: tagArray,
        emotionalState: data.emotionalState,
        interpretation: interpretation || undefined
      });
      
      reset();
    } catch (error) {
      console.error("Error getting dream interpretation:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="dream-form-container"
    >
      <h2>Log Your Dream</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-group">
          <label htmlFor="title">Dream Title</label>
          <input 
            id="title"
            type="text" 
            {...register("title", { required: true })}
            placeholder="Enter a title for your dream" 
          />
          {errors.title && <span className="error">Title is required</span>}
        </div>
        
        <div className="form-group">
          <label htmlFor="date">Date</label>
          <input 
            id="date"
            type="date" 
            {...register("date", { required: true })}
            defaultValue={format(new Date(), 'yyyy-MM-dd')}
          />
          {errors.date && <span className="error">Date is required</span>}
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Dream Description</label>
          <textarea 
            id="description"
            {...register("description", { required: true })}
            placeholder="Describe your dream in detail..." 
            rows={6}
          />
          {errors.description && <span className="error">Description is required</span>}
        </div>
        
        <div className="form-group">
          <label htmlFor="tags">Tags (comma separated)</label>
          <input 
            id="tags"
            type="text" 
            {...register("tags")}
            placeholder="e.g. water, flying, chase" 
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="emotionalState">Emotional State</label>
          <select id="emotionalState" {...register("emotionalState")}>
            <option value="">Select emotion...</option>
            <option value="joyful">Joyful</option>
            <option value="anxious">Anxious</option>
            <option value="fearful">Fearful</option>
            <option value="peaceful">Peaceful</option>
            <option value="confused">Confused</option>
          </select>
        </div>
        
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="submit-button"
        >
          {isSubmitting ? 'Analyzing Dream...' : 'Save Dream'}
        </button>
      </form>
    </motion.div>
  );
};