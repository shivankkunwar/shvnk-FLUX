import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface HealthContextType {
  p5: boolean;
  manim: boolean;
}

const HealthContext = createContext<HealthContextType>({ p5: false, manim: false });

export const HealthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [health, setHealth] = useState<HealthContextType>({ p5: false, manim: false });

  useEffect(() => {
    (async () => {
      try {
        // Check if we're in Electron environment
        if (!window.electronAPI) {
          console.warn('Electron API not available - running in development mode');
          setHealth({ p5: false, manim: false });
          return;
        }

        // Parallel health checks for both engines
        const [resultP5, resultManim] = await Promise.all([
          window.electronAPI.checkHealth(),
          window.electronAPI.checkHealth()
        ])

        setHealth({
          p5: resultP5.success && (resultP5.p5?.available ?? false),
          manim: resultManim.success && (resultManim.manim?.available ?? false)
        })
      } catch (error) {
        console.error('Health check failed:', error);
        setHealth({ p5: false, manim: false });
      }
    })();
  }, []);

  return (
    <HealthContext.Provider value={health}>
      {children}
    </HealthContext.Provider>
  );
};

export const useHealth = (): HealthContextType => {
  const ctx = useContext(HealthContext);
  if (!ctx) {
    throw new Error('useHealth must be used within HealthProvider');
  }
  return ctx;
}; 