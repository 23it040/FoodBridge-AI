import { createContext, useMemo, useState } from 'react';

export const AppContext = createContext(null);

const AppProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const [isLoading, setIsLoading] = useState(false);

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      isLoading,
      setIsLoading
    }),
    [theme, isLoading]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppProvider;
