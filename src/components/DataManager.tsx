import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useDreamStore } from '../stores/dreamStore';

export const DataManager: React.FC = () => {
  const { exportDreams, importDreams } = useDreamStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleExport = () => {
    const dreamsJson = exportDreams();
    const blob = new Blob([dreamsJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dream-journal-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage({ text: 'Dreams exported successfully!', type: 'success' });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (content) {
          const success = importDreams(content);
          if (success) {
            setMessage({ text: 'Dreams imported successfully!', type: 'success' });
          } else {
            setMessage({ text: 'Failed to import dreams. Invalid file format.', type: 'error' });
          }
          setTimeout(() => setMessage(null), 3000);
        }
      };
      reader.readAsText(file);
    }
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="data-manager">
      <h3>Data Management</h3>
      <div className="data-buttons">
        <button className="data-button export" onClick={handleExport}>
          Export Dreams
        </button>
        <button className="data-button import" onClick={handleImportClick}>
          Import Dreams
        </button>
        <input
          type="file"
          accept=".json"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </div>
      
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className={`message ${message.type}`}
        >
          {message.text}
        </motion.div>
      )}
      
      <div className="data-info">
        <p>
          Your dreams are automatically saved in your browser's local storage.
          Use the export feature to backup your dreams or transfer them to another device.
        </p>
      </div>
    </div>
  );
};