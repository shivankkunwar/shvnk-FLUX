import React, { useState, useEffect } from 'react';

interface HealthRequirement {
  name: string;
  critical: boolean;
  available: boolean;
  message: string;
  solution?: string;
}

interface HealthData {
  success: boolean;
  p5?: { [key: string]: HealthRequirement };
  p5Readiness?: { ready: boolean; criticalMet: number; criticalTotal: number };
  manim?: { [key: string]: HealthRequirement };
  manimReadiness?: { ready: boolean; criticalMet: number; criticalTotal: number };
}

interface CompactHealthStatusProps {
  selectedEngine: 'p5' | 'manim';
}

const CompactHealthStatus: React.FC<CompactHealthStatusProps> = ({ selectedEngine }) => {
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const checkHealth = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:4000/api/health?engine=${selectedEngine}`);
      const data = await response.json();
      setHealthData(data);
    } catch (error) {
      console.error('Health check failed:', error);
      setHealthData({ success: false });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, [selectedEngine]);

  // Simple SVG icons
  const LoadingIcon = () => (
    <svg className="w-4 h-4 text-blue-400 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );

  const CheckIcon = () => (
    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  const XIcon = () => (
    <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  const WarningIcon = () => (
    <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
    </svg>
  );

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <LoadingIcon />
        <span className="text-xs text-gray-400">Checking...</span>
      </div>
    );
  }

  if (!healthData?.success) {
    return (
      <div className="flex items-center space-x-2">
        <XIcon />
        <span className="text-xs text-red-400">Health check failed</span>
      </div>
    );
  }

  const readiness = selectedEngine === 'p5' ? healthData.p5Readiness : healthData.manimReadiness;
  const requirements = selectedEngine === 'p5' ? healthData.p5 : healthData.manim;

  if (!readiness || !requirements) {
    return (
      <div className="flex items-center space-x-2">
        <WarningIcon />
        <span className="text-xs text-yellow-400">No data</span>
      </div>
    );
  }

  const criticalMissing = Object.values(requirements).filter(req => req.critical && !req.available);
  const isReady = readiness.ready;

  return (
    <div className="relative">
      <div
        className="flex items-center space-x-2 cursor-pointer"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={checkHealth}
      >
        {/* Status light */}
        <div className="relative">
          <div className={`w-3 h-3 rounded-full ${isReady ? 'bg-green-400' : 'bg-red-400'}`}></div>
          <div className={`absolute inset-0 w-3 h-3 rounded-full ${isReady ? 'bg-green-400 animate-ping' : 'bg-red-400 animate-pulse'} opacity-75`}></div>
        </div>

        {/* Status icon */}
        {isReady ? (
          <CheckIcon />
        ) : (
          <XIcon />
        )}

        {/* Status text */}
        <span className={`text-xs ${isReady ? 'text-green-400' : 'text-red-400'}`}>
          {isReady ? `${selectedEngine.toUpperCase()} Ready` : `${selectedEngine.toUpperCase()} Issues`}
        </span>
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-lg z-50">
          <div className="text-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-200">{selectedEngine.toUpperCase()} Engine</span>
              <span className={`text-xs px-2 py-1 rounded ${isReady ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'}`}>
                {isReady ? 'READY' : 'NOT READY'}
              </span>
            </div>
            
            <div className="space-y-1 mb-2">
              {Object.entries(requirements).map(([key, req]) => (
                <div key={key} className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${req.available ? 'bg-green-400' : req.critical ? 'bg-red-400' : 'bg-yellow-400'}`}></div>
                  <span className={`text-xs ${req.available ? 'text-gray-300' : 'text-gray-400'}`}>
                    {req.name}
                  </span>
                  {req.critical && !req.available && (
                    <span className="text-xs text-red-400">*</span>
                  )}
                </div>
              ))}
            </div>

            {criticalMissing.length > 0 && (
              <div className="text-xs text-red-300 border-t border-gray-700 pt-2">
                Missing critical: {criticalMissing.map(req => req.name).join(', ')}
              </div>
            )}
            
            <div className="text-xs text-gray-500 mt-2">
              Click to refresh • * = Critical
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompactHealthStatus; 