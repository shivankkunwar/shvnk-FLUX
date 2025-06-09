import React, { useState, useEffect, useRef, useCallback } from 'react';

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

interface SimpleHealthStatusProps {
  selectedEngine: 'p5' | 'manim';
}

const SimpleHealthStatus: React.FC<SimpleHealthStatusProps> = ({ selectedEngine }) => {
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [lastEngine, setLastEngine] = useState(selectedEngine);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const checkHealth = useCallback(async (engine: string = selectedEngine) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:4000/api/health?engine=${engine}`);
      const data = await response.json();
      setHealthData(data);
    } catch (error) {
      console.error('Health check failed:', error);
      setHealthData({ success: false });
    } finally {
      setLoading(false);
    }
  }, [selectedEngine]);

  // Handle engine changes immediately
  useEffect(() => {
    if (lastEngine !== selectedEngine) {
      setLastEngine(selectedEngine);
      checkHealth(selectedEngine);
    }
  }, [selectedEngine, lastEngine, checkHealth]);

  // Initial check and periodic refresh
  useEffect(() => {
    checkHealth();
    const interval = setInterval(() => checkHealth(), 30000);
    return () => clearInterval(interval);
  }, [checkHealth]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRefresh = () => {
    checkHealth();
  };

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDropdown(!showDropdown);
  };

  const readiness = selectedEngine === 'p5' ? healthData?.p5Readiness : healthData?.manimReadiness;
  const requirements = selectedEngine === 'p5' ? healthData?.p5 : healthData?.manim;
  const isReady = readiness?.ready ?? false;
  const hasIssues = !healthData?.success || !isReady;

  // Count issues
  const issueCount = requirements ? 
    Object.values(requirements).filter(req => !req.available && req.critical).length : 
    (healthData?.success ? 0 : 1);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Professional notification button */}
      <button
        onClick={toggleDropdown}
        className="relative flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-800/50 transition-all duration-200 group"
        title={`${selectedEngine.toUpperCase()} Engine Health`}
      >
        {/* Status indicator with notification badge */}
        <div className="relative">
          {/* Main status icon */}
          <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300 ${
            loading 
              ? 'bg-blue-500/20 border border-blue-400' 
              : isReady 
                ? 'bg-green-500/20 border border-green-400' 
                : 'bg-red-500/20 border border-red-400'
          }`}>
            {loading ? (
              <svg className="w-3 h-3 text-blue-400 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
            ) : isReady ? (
              <svg className="w-3 h-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
              </svg>
            ) : (
              <svg className="w-3 h-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
              </svg>
            )}
          </div>
          
          {/* Issue count badge */}
          {hasIssues && issueCount > 0 && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium border-2 border-gray-900">
              {issueCount > 9 ? '9+' : issueCount}
            </div>
          )}
        </div>

        {/* Engine label */}
        <span className="text-sm font-medium text-gray-300 group-hover:text-gray-200 transition-colors">
          {selectedEngine.toUpperCase()}
        </span>

        {/* Dropdown chevron */}
        <svg 
          className={`w-3 h-3 text-gray-500 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
        </svg>
      </button>

      {/* Professional notification dropdown */}
      {showDropdown && (
        <div className="absolute top-full right-0 mt-2 w-96 z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden backdrop-blur-xl" style={{
            background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.98) 0%, rgba(31, 41, 55, 0.98) 100%)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.1)'
          }}>
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-700/50" style={{
              background: 'linear-gradient(135deg, rgba(55, 65, 81, 0.6) 0%, rgba(75, 85, 99, 0.4) 100%)'
            }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${isReady ? 'bg-green-400' : 'bg-red-400'} animate-pulse`}></div>
                  <h3 className="font-semibold text-gray-100">
                    {selectedEngine.toUpperCase()} Engine
                  </h3>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    isReady 
                      ? 'bg-green-900/50 text-green-300 border border-green-700/50' 
                      : 'bg-red-900/50 text-red-300 border border-red-700/50'
                  }`}>
                    {isReady ? 'Operational' : 'Issues'}
                  </div>
                </div>
                <button
                  onClick={handleRefresh}
                  className="p-1.5 rounded-lg hover:bg-gray-700 transition-colors"
                  title="Refresh status"
                >
                  <svg className={`w-4 h-4 text-gray-400 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="max-h-80 overflow-y-auto">
              {!healthData?.success ? (
                <div className="p-5">
                  <div className="flex items-start space-x-3 p-4 bg-red-900/20 border border-red-700/30 rounded-lg">
                    <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <div>
                      <h4 className="font-medium text-red-200">Server Offline</h4>
                      <p className="text-sm text-red-300 mt-1">Backend server is not responding. Check if it's running on port 4000.</p>
                    </div>
                  </div>
                </div>
              ) : requirements ? (
                <div>
                  {Object.entries(requirements).map(([key, req], index) => (
                    <div key={key} className="px-5 py-4 border-b border-gray-700/30 last:border-b-0 hover:bg-gray-800/30 transition-colors" style={{
                      background: index % 2 === 0 ? 'rgba(55, 65, 81, 0.05)' : 'transparent'
                    }}>
                      <div className="flex items-start space-x-4">
                        <div className="relative mt-1 flex-shrink-0">
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                            req.available 
                              ? 'bg-green-500/20 border border-green-400' 
                              : req.critical 
                                ? 'bg-red-500/20 border border-red-400' 
                                : 'bg-yellow-500/20 border border-yellow-400'
                          }`}>
                            {req.available ? (
                              <svg className="w-2.5 h-2.5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/>
                              </svg>
                            ) : (
                              <svg className={`w-2.5 h-2.5 ${req.critical ? 'text-red-400' : 'text-yellow-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01"/>
                              </svg>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium text-gray-200">{req.name}</h4>
                            {req.critical && (
                              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-900/50 text-red-300 border border-red-700/50">
                                Critical
                              </span>
                            )}
                            {req.available && (
                              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-900/50 text-green-300 border border-green-700/50">
                                OK
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-400 leading-relaxed">{req.message}</p>
                          
                          {!req.available && req.solution && (
                            <div className="mt-3 p-3 bg-gradient-to-r from-orange-900/20 to-red-900/20 border border-orange-700/30 rounded-lg">
                              <div className="flex items-start space-x-2">
                                <svg className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                                <div className="flex-1">
                                  <h5 className="text-sm font-medium text-orange-300 mb-1">Solution</h5>
                                  <p className="text-sm text-gray-300 leading-relaxed">{req.solution}</p>
                                  {req.solution.includes('`') && (
                                    <div className="mt-2 p-2 bg-gray-900/80 border border-gray-600/30 rounded text-xs font-mono text-green-400 select-all cursor-pointer">
                                      {req.solution.match(/`([^`]+)`/)?.[1]}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center">
                  <svg className="w-8 h-8 text-gray-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0118 12a8 8 0 00-8-8 8 8 0 00-8 8c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  <p className="text-gray-400 mb-3">No status data available</p>
                  <button 
                    onClick={handleRefresh}
                    className="px-4 py-2 bg-blue-600/80 hover:bg-blue-600 text-blue-100 rounded-lg text-sm font-medium transition-all duration-200"
                  >
                    Check Status
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-gray-700/50" style={{
              background: 'linear-gradient(135deg, rgba(55, 65, 81, 0.6) 0%, rgba(75, 85, 99, 0.4) 100%)'
            }}>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
                  <span>Auto-refresh: 30s</span>
                </div>
                <span>Updated: {new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleHealthStatus; 