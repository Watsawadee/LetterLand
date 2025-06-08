import React, { createContext, useContext, useState } from "react";

export const useTheme = () => useContext(ThemeContext);

const ThemeContext = createContext<any>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [fontSize, setFontSize] = useState(20);
  const [primaryColor, setPrimaryColor] = useState('black');

  return (
    <ThemeContext.Provider value={{ fontSize, setFontSize, primaryColor, setPrimaryColor }}>
      {children}
    </ThemeContext.Provider>
  );
}
