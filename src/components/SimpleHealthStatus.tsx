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
  const [copiedCommandKey, setCopiedCommandKey] = useState<string | null>(null); // State for copy feedback
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleCopyCommand = (command: string, commandKey: string) => {
    navigator.clipboard.writeText(command).then(() => {
      setCopiedCommandKey(commandKey);
      setTimeout(() => setCopiedCommandKey(null), 2000); // Reset after 2 seconds
    }).catch(err => {
      console.error('Failed to copy command: ', err);
    });
  };

  const checkHealth = useCallback(async (engine: string = selectedEngine) => {
    setLoading(true);
    try {
      // Use Electron IPC instead of HTTP fetch
      if (window.electronAPI) {
        const ipcData = await window.electronAPI.checkHealth();
        // Convert IPC response to expected format
        const data: HealthData = {
          success: ipcData.status === 'healthy',
          // For now, just set basic readiness based on IPC response
          p5Readiness: { ready: ipcData.status === 'healthy', criticalMet: 1, criticalTotal: 1 },
          manimReadiness: { ready: ipcData.status === 'healthy', criticalMet: 1, criticalTotal: 1 }
        };
        setHealthData(data);
      } else {
        // Fallback for non-Electron environment (shouldn't happen in production)
        const response = await fetch(`http://localhost:4000/api/health?engine=${engine}`);
        const data = await response.json();
        setHealthData(data);
      }
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
        className="relative flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-700/70 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-200 group"
        title={`${selectedEngine.toUpperCase()} Engine Health`}
        aria-haspopup="true"
        aria-expanded={showDropdown}
        aria-controls="health-status-dropdown"
      >
        {/* Status indicator with notification badge */}
        <div className="relative">
          {/* Main status icon */}
          <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300 border ${
            loading 
              ? 'bg-blue-500/20 border-blue-400'
              : isReady 
                ? 'bg-green-500/20 border-green-400'
                : 'bg-red-500/20 border-red-400'
          }`}>
            {loading ? (
              <svg className="w-3 h-3 text-blue-400 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
            ) : isReady ? (
              <svg className="w-3 h-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
              </svg>
            ) : (
              <svg className="w-3 h-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
              </svg>
            )}
          </div>
          
          {/* Issue count badge */}
          {hasIssues && issueCount > 0 && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium border-2 border-gray-900" aria-hidden="true">
              {issueCount > 9 ? '9+' : issueCount}
            </div>
          )}
        </div>

        {/* Engine label */}
        <span className="text-sm font-medium text-gray-300 group-hover:text-gray-100 transition-colors">
          {selectedEngine.toUpperCase()}
        </span>

        {/* Dropdown chevron */}
        <svg 
          className={`w-3 h-3 text-gray-500 group-hover:text-gray-400 transition-transform transition-colors duration-200 ${showDropdown ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
        </svg>
      </button>

      {/* Professional notification dropdown */}
      {showDropdown && (
        <div id="health-status-dropdown" className="absolute top-full right-0 mt-2 w-96 z-50">
          <div className="bg-gray-800 border border-gray-700/80 rounded-xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-700/60 bg-gray-700/40">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${isReady ? 'bg-green-400' : 'bg-red-400'} animate-pulse`} aria-hidden="true"></div>
                  <h3 className="font-semibold text-gray-100">
                    {selectedEngine.toUpperCase()} Engine
                  </h3>
                  <div className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                    isReady 
                      ? 'bg-green-500/20 text-green-200 border-green-500/40'
                      : 'bg-red-500/20 text-red-200 border-red-500/40'
                  }`}>
                    {isReady ? 'Operational' : 'Issues'}
                  </div>
                </div>
                <button
                  onClick={handleRefresh}
                  className="p-1.5 rounded-lg hover:bg-gray-600/70 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:ring-offset-gray-700 transition-colors"
                  title="Refresh status"
                >
                  <svg className={`w-4 h-4 text-gray-400 group-hover:text-gray-200 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="max-h-80 overflow-y-auto">
              {!healthData?.success ? (
                <div className="p-5">
                  <div className="flex items-start space-x-3 p-4 bg-red-500/10 border border-red-500/40 rounded-lg">
                    <svg className="w-5 h-5 text-red-300 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <div>
                      <h4 className="font-medium text-red-200">Server Offline</h4>
                      <p className="text-sm text-red-300/80 mt-1">Backend server is not responding. Check if it's running on port 4000.</p>
                    </div>
                  </div>
                </div>
              ) : requirements ? (
                <div>
                  {/* Critical Issues Section */}
                  <div className="px-5 pt-4 pb-2">
                    <h4 className="text-xs font-semibold text-red-400 uppercase tracking-wider">Critical Issues</h4>
                  </div>
                  {Object.entries(requirements)
                    .filter(([_, req]) => req.critical && !req.available)
                    .map(([key, req]) => (
                      <div key={key} className="px-5 py-3 border-b border-gray-700/60 last:border-b-0 bg-red-500/10 hover:bg-red-500/20 transition-colors">
                        <div className="flex items-start space-x-3">
                          <div className="relative mt-1 flex-shrink-0">
                            <div className="w-3.5 h-3.5 rounded-full flex items-center justify-center bg-red-500/20 border border-red-400">
                              <svg className="w-2 h-2 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01"/>
                              </svg>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-semibold text-red-200 mb-1">{req.name}</h5>
                            <p className="text-sm text-red-300/80 leading-relaxed mb-1.5">{req.message}</p>
                            {req.solution && (
                              <div className="mt-2 p-2.5 bg-red-500/10 border border-red-500/40 rounded-md">
                                <div className="flex items-start space-x-2.5">
                                  <svg className="w-3.5 h-3.5 text-orange-300 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 4h.01"/>
                                  </svg>
                                  <div className="flex-1">
                                    <h6 className="text-xs font-semibold text-orange-300 mb-0.5 tracking-wide">Solution</h6>
                                    {req.solution.includes('`') ? (
                                      <>
                                        <p className="text-xs text-orange-300/80 leading-relaxed">
                                          {req.solution.substring(0, req.solution.indexOf('`'))}
                                        </p>
                                        {(() => {
                                          const commandMatch = req.solution.match(/`([^`]+)`/);
                                          const command = commandMatch ? commandMatch[1] : '';
                                          const commandKey = `${key}-critical-cmd`;
                                          return (
                                            <div className="my-1 flex items-center justify-between p-1.5 bg-gray-900/70 border border-gray-700/80 rounded group">
                                              <pre className="text-xs font-mono text-green-300 select-all overflow-x-auto whitespace-pre-wrap break-all">
                                                {command}
                                              </pre>
                                              <button
                                                onClick={() => handleCopyCommand(command, commandKey)}
                                                className={`ml-2 px-2 py-0.5 text-xs rounded transition-all duration-150 ease-in-out
                                                  ${copiedCommandKey === commandKey
                                                    ? 'bg-green-500 text-white'
                                                    : 'bg-gray-600 hover:bg-gray-500 text-gray-300 group-hover:opacity-100 opacity-0 focus:opacity-100 focus:ring-2 focus:ring-green-500 focus:ring-offset-1 focus:ring-offset-gray-800'}`}
                                              >
                                                {copiedCommandKey === commandKey ? 'Copied!' : 'Copy'}
                                              </button>
                                            </div>
                                          );
                                        })()}
                                        <p className="text-xs text-orange-300/80 leading-relaxed">
                                          {req.solution.substring(req.solution.indexOf('`') + req.solution.match(/`([^`]+)`/)?.[0].length)}
                                        </p>
                                      </>
                                    ) : (
                                      <p className="text-xs text-orange-300/80 leading-relaxed">{req.solution}</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  {Object.entries(requirements).filter(([_, req]) => req.critical && !req.available).length === 0 && (
                    <div className="px-5 py-4 text-sm text-gray-500 italic">No critical issues found. System operational.</div>
                  )}

                  {/* Other Information Section */}
                  <div className="px-5 pt-4 pb-2 mt-2 border-t border-gray-700/60">
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Other Information</h4>
                  </div>
                  {Object.entries(requirements)
                    .filter(([_, req]) => !req.critical || req.available)
                    .map(([key, req]) => (
                      <div key={key} className="px-5 py-4 border-b border-gray-700/60 last:border-b-0 hover:bg-gray-700/40 even:bg-gray-800/30 transition-colors">
                        <div className="flex items-start space-x-3">
                          <div className="relative mt-1 flex-shrink-0">
                            <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border ${
                              req.available
                                ? 'bg-green-500/20 border-green-400'
                                : 'bg-yellow-500/20 border-yellow-400'
                            }`}>
                              {req.available ? (
                                <svg className="w-2 h-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/>
                                </svg>
                              ) : (
                                <svg className="w-2 h-2 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01"/>
                                </svg>
                              )}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <h5 className="font-medium text-gray-200">{req.name}</h5>
                              {req.available && (
                                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-200 border border-green-500/40">
                                  OK
                                </span>
                              )}
                              {!req.available && !req.critical && (
                                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-200 border border-yellow-500/40">
                                  Warning
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-400/90 leading-relaxed mb-1.5">{req.message}</p>
                            {!req.available && req.solution && (
                              <div className={`mt-2 p-2.5 rounded-md border ${
                                req.critical ? "bg-red-500/10 border-red-500/40" : "bg-yellow-500/10 border-yellow-500/40"
                              }`}>
                                <div className="flex items-start space-x-2.5">
                                   <svg className="w-3.5 h-3.5 text-orange-300 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 4h.01"/>
                                  </svg>
                                  <div className="flex-1">
                                    <h6 className="text-xs font-semibold text-orange-300 mb-0.5 tracking-wide">Solution</h6>
                                    {req.solution.includes('`') ? (
                                      <>
                                        <p className="text-xs text-orange-300/80 leading-relaxed">
                                          {req.solution.substring(0, req.solution.indexOf('`'))}
                                        </p>
                                        {(() => {
                                          const commandMatch = req.solution.match(/`([^`]+)`/);
                                          const command = commandMatch ? commandMatch[1] : '';
                                          const commandKey = `${key}-other-cmd`;
                                          return (
                                            <div className="my-1 flex items-center justify-between p-1.5 bg-gray-900/70 border border-gray-700/80 rounded group">
                                              <pre className="text-xs font-mono text-green-300 select-all overflow-x-auto whitespace-pre-wrap break-all">
                                                {command}
                                              </pre>
                                              <button
                                                onClick={() => handleCopyCommand(command, commandKey)}
                                                className={`ml-2 px-2 py-0.5 text-xs rounded transition-all duration-150 ease-in-out
                                                  ${copiedCommandKey === commandKey
                                                    ? 'bg-green-500 text-white'
                                                    : 'bg-gray-600 hover:bg-gray-500 text-gray-300 group-hover:opacity-100 opacity-0 focus:opacity-100 focus:ring-2 focus:ring-green-500 focus:ring-offset-1 focus:ring-offset-gray-800'}`}
                                              >
                                                {copiedCommandKey === commandKey ? 'Copied!' : 'Copy'}
                                              </button>
                                            </div>
                                          );
                                        })()}
                                        <p className="text-xs text-orange-300/80 leading-relaxed">
                                          {req.solution.substring(req.solution.indexOf('`') + req.solution.match(/`([^`]+)`/)?.[0].length)}
                                        </p>
                                      </>
                                    ) : (
                                      <p className="text-xs text-orange-300/80 leading-relaxed">{req.solution}</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  {Object.entries(requirements).filter(([_, req]) => !req.critical || req.available).length === 0 && (
                    <div className="px-5 py-4 text-sm text-gray-500 italic">No other information available.</div>
                  )}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <svg className="w-8 h-8 text-gray-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0118 12a8 8 0 00-8-8 8 8 0 00-8 8c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  <p className="text-gray-400/90 mb-3">No status data available</p>
                  <button 
                    onClick={handleRefresh}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 text-white rounded-lg text-sm font-medium transition-all duration-200"
                  >
                    Check Status
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-gray-700/50 bg-gray-700/30">
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