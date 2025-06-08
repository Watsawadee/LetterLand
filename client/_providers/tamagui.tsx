import { TamaguiProvider, Theme } from "tamagui";
import tamaguiConfig from "../tamagui.config";
import { useState, useEffect } from "react";

const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  if (!ready) return null;

  return (
    <TamaguiProvider config={tamaguiConfig}>
      <Theme name="light">{children}</Theme>
    </TamaguiProvider>
  );
};

export default AppProvider;
