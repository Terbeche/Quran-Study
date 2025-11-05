'use client';

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

interface ReciterContextType {
  currentReciterId: number;
  setCurrentReciterId: (id: number) => void;
}

const ReciterContext = createContext<ReciterContextType | undefined>(undefined);

export function ReciterProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [currentReciterId, setCurrentReciterId] = useState(7); // Default: Alafasy

  const value = useMemo(() => ({ currentReciterId, setCurrentReciterId }), [currentReciterId]);

  return (
    <ReciterContext.Provider value={value}>
      {children}
    </ReciterContext.Provider>
  );
}

export function useReciter() {
  const context = useContext(ReciterContext);
  
  // If not within a provider, return default values
  if (context === undefined) {
    return {
      currentReciterId: 7, // Default: Alafasy
      setCurrentReciterId: () => {}, // No-op function
    };
  }
  return context;
}
