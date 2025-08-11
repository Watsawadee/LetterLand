import React, { createContext, useContext, useState } from "react";


const ThemeContext = createContext<any>(null);
export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [fontSize, setFontSize] = useState(32);
  const [primaryColor, setPrimaryColor] = useState('black');

  return (
    <ThemeContext.Provider value={{ fontSize, setFontSize, primaryColor, setPrimaryColor }}>
      {children}
    </ThemeContext.Provider>
  );
}
