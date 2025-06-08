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
        const [resP5, resManim] = await Promise.all([
          fetch('/health?engine=p5'),
          fetch('/health?engine=manim')
        ]);
        const jsonP5 = await resP5.json();
        const jsonManim = await resManim.json();
        setHealth({ p5: jsonP5.available, manim: jsonManim.available });
      } catch {
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