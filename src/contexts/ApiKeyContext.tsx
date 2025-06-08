import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface ApiKeyContextType {
  apiKey: string;
  setApiKey: (key: string) => void;
}

const ApiKeyContext = createContext<ApiKeyContextType | undefined>(undefined);

export const ApiKeyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize from localStorage if present
  const [apiKey, setApiKeyState] = useState<string>(() => {
    return localStorage.getItem('API_KEY') || '';
  });

  const setApiKey = (key: string) => {
    localStorage.setItem('API_KEY', key);
    setApiKeyState(key);
  };

  return (
    <ApiKeyContext.Provider value={{ apiKey, setApiKey }}>
      {children}
    </ApiKeyContext.Provider>
  );
};

export const useApiKey = (): ApiKeyContextType => {
  const ctx = useContext(ApiKeyContext);
  if (!ctx) {
    throw new Error('useApiKey must be used within ApiKeyProvider');
  }
  return ctx;
}; 