import React, { useState } from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

interface UpdateCheckerProps {
  onUpdateCheck: () => void;
}

const UpdateChecker: React.FC<UpdateCheckerProps> = ({ onUpdateCheck }) => {
  const [isChecking, setIsChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const handleCheckForUpdates = async () => {
    setIsChecking(true);
    try {
      const result = await window.electronAPI.updater.checkForUpdates();
      setLastChecked(new Date());
      onUpdateCheck();
      
      if (result.error) {
        console.error('Update check failed:', result.error);
      }
    } catch (error) {
      console.error('Update check error:', error);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleCheckForUpdates}
        disabled={isChecking}
        className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:cursor-not-allowed rounded-md transition-colors"
      >
        <ArrowPathIcon 
          className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} 
        />
        {isChecking ? 'Checking...' : 'Check for Updates'}
      </button>
      
      {lastChecked && !isChecking && (
        <span className="text-xs text-gray-500">
          Last checked: {lastChecked.toLocaleTimeString()}
        </span>
      )}
    </div>
  );
};

export default UpdateChecker; 