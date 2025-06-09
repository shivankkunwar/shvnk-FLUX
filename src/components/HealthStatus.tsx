import React, { useState, useEffect } from 'react';
import { ChevronRightIcon, CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface HealthRequirement {
  name: string;
  critical: boolean;
  available: boolean;
  message: string;
  solution?: string;
  path?: string;
}

interface EngineHealth {
  [key: string]: HealthRequirement;
}

interface HealthReadiness {
  ready: boolean;
  criticalMet: number;
  criticalTotal: number;
  overallScore: number;
  totalRequirements: number;
  metRequirements: number;
}

interface HealthData {
  success: boolean;
  timestamp: string;
  engine: string;
  p5?: EngineHealth;
  p5Readiness?: HealthReadiness;
  manim?: EngineHealth;
  manimReadiness?: HealthReadiness;
  error?: string;
}

interface HealthStatusProps {
  selectedEngine: 'p5' | 'manim';
  onHealthChange?: (isHealthy: boolean) => void;
}

const HealthStatus: React.FC<HealthStatusProps> = ({ selectedEngine, onHealthChange }) => {
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedSolutions, setExpandedSolutions] = useState<Set<string>>(new Set());
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkHealth = async (engine: string = selectedEngine) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:4000/api/health?engine=${engine}`);
      const data = await response.json();
      setHealthData(data);
      setLastChecked(new Date());
      
      // Notify parent about health status
      if (onHealthChange) {
        const readiness = engine === 'p5' ? data.p5Readiness : data.manimReadiness;
        onHealthChange(readiness?.ready || false);
      }
    } catch (error) {
      console.error('Health check failed:', error);
      setHealthData({
        success: false,
        error: 'Failed to connect to server',
        timestamp: new Date().toISOString(),
        engine: engine
      });
      if (onHealthChange) onHealthChange(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth(selectedEngine);
  }, [selectedEngine]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      checkHealth(selectedEngine);
    }, 30000);

    return () => clearInterval(interval);
  }, [selectedEngine]);

  const toggleSolution = (key: string) => {
    const newExpanded = new Set(expandedSolutions);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedSolutions(newExpanded);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getStatusIcon = (available: boolean, critical: boolean) => {
    if (available) {
      return <CheckCircleIcon className="w-5 h-5 text-green-400" />;
    } else if (critical) {
      return <XCircleIcon className="w-5 h-5 text-red-400" />;
    } else {
      return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400" />;
    }
  };

  const getStatusLight = (available: boolean, critical: boolean) => {
    if (available) {
      return (
        <div className="relative">
          <div className="w-3 h-3 bg-green-400 rounded-full"></div>
          <div className="absolute inset-0 w-3 h-3 bg-green-400 rounded-full animate-ping opacity-75"></div>
        </div>
      );
    } else if (critical) {
      return (
        <div className="relative">
          <div className="w-3 h-3 bg-red-400 rounded-full"></div>
          <div className="absolute inset-0 w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
        </div>
      );
    } else {
      return (
        <div className="relative">
          <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
          <div className="absolute inset-0 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
        </div>
      );
    }
  };

  const renderRequirement = (key: string, req: HealthRequirement) => {
    const expanded = expandedSolutions.has(key);
    
    return (
      <div key={key} className="border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getStatusLight(req.available, req.critical)}
            {getStatusIcon(req.available, req.critical)}
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-200 font-medium">{req.name}</span>
                {req.critical && <span className="text-xs bg-red-900 text-red-200 px-2 py-1 rounded">Critical</span>}
              </div>
              <p className="text-sm text-gray-400 mt-1">{req.message}</p>
              {req.path && (
                <p className="text-xs text-gray-500 mt-1 font-mono">
                  Path: {req.path.length > 50 ? `...${req.path.slice(-50)}` : req.path}
                </p>
              )}
            </div>
          </div>
          
          {!req.available && req.solution && (
            <button
              onClick={() => toggleSolution(key)}
              className="flex items-center space-x-1 text-blue-400 hover:text-blue-300 transition-colors"
            >
              <span className="text-sm">Fix</span>
              <ChevronRightIcon className={`w-4 h-4 transform transition-transform ${expanded ? 'rotate-90' : ''}`} />
            </button>
          )}
        </div>

        {expanded && !req.available && req.solution && (
          <div className="mt-4 p-3 bg-gray-900 rounded-lg border border-gray-800">
            <h4 className="text-sm font-medium text-gray-200 mb-2">How to fix:</h4>
            <p className="text-sm text-gray-300 mb-3">{req.solution}</p>
            
            {/* Extract command if present */}
            {req.solution.includes('`') && (
              <div className="bg-gray-950 p-2 rounded border border-gray-700">
                <div className="flex items-center justify-between">
                  <code className="text-green-400 text-sm font-mono">
                    {req.solution.match(/`([^`]+)`/)?.[1] || ''}
                  </code>
                  <button
                    onClick={() => copyToClipboard(req.solution?.match(/`([^`]+)`/)?.[1] || '')}
                    className="text-xs text-gray-400 hover:text-gray-200 transition-colors"
                  >
                    Copy
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  if (loading && !healthData) {
    return (
      <div className="bg-gray-950 border border-gray-800 rounded-xl p-6">
        <div className="flex items-center space-x-3">
          <ArrowPathIcon className="w-5 h-5 text-blue-400 animate-spin" />
          <span className="text-gray-300">Checking system health...</span>
        </div>
      </div>
    );
  }

  if (!healthData || !healthData.success) {
    return (
      <div className="bg-gray-950 border border-red-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-red-400">Health Check Failed</h3>
          <button
            onClick={() => checkHealth()}
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            Retry
          </button>
        </div>
        <p className="text-gray-300">{healthData?.error || 'Unknown error occurred'}</p>
      </div>
    );
  }

  const engineData = selectedEngine === 'p5' ? healthData.p5 : healthData.manim;
  const readiness = selectedEngine === 'p5' ? healthData.p5Readiness : healthData.manimReadiness;

  if (!engineData || !readiness) {
    return (
      <div className="bg-gray-950 border border-gray-800 rounded-xl p-6">
        <p className="text-gray-400">No health data available for {selectedEngine.toUpperCase()}</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-950 border border-gray-800 rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          {getStatusLight(readiness.ready, true)}
          <h3 className="text-lg font-semibold text-gray-200">
            {selectedEngine.toUpperCase()} Engine Status
          </h3>
        </div>
        <button
          onClick={() => checkHealth()}
          disabled={loading}
          className="flex items-center space-x-2 text-sm text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50"
        >
          <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Overall Status */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-900 p-3 rounded-lg">
          <div className="text-2xl font-bold text-gray-200">{readiness.overallScore}%</div>
          <div className="text-xs text-gray-400">Overall Score</div>
        </div>
        <div className="bg-gray-900 p-3 rounded-lg">
          <div className="text-2xl font-bold text-gray-200">
            {readiness.criticalMet}/{readiness.criticalTotal}
          </div>
          <div className="text-xs text-gray-400">Critical Met</div>
        </div>
        <div className="bg-gray-900 p-3 rounded-lg">
          <div className="text-2xl font-bold text-gray-200">
            {readiness.metRequirements}/{readiness.totalRequirements}
          </div>
          <div className="text-xs text-gray-400">Total Met</div>
        </div>
        <div className="bg-gray-900 p-3 rounded-lg">
          <div className={`text-2xl font-bold ${readiness.ready ? 'text-green-400' : 'text-red-400'}`}>
            {readiness.ready ? 'READY' : 'NOT READY'}
          </div>
          <div className="text-xs text-gray-400">Status</div>
        </div>
      </div>

      {/* Requirements List */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-300 mb-3">Requirements:</h4>
        {Object.entries(engineData).map(([key, requirement]) =>
          renderRequirement(key, requirement)
        )}
      </div>

      {/* Last Checked */}
      {lastChecked && (
        <div className="mt-4 pt-4 border-t border-gray-800">
          <p className="text-xs text-gray-500">
            Last checked: {lastChecked.toLocaleTimeString()}
          </p>
        </div>
      )}
    </div>
  );
};

export default HealthStatus; 