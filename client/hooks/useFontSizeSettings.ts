import { useState } from "react";

export function useFontSizeSettings(defaultFontSize = 32) {
  const [fontSize, setFontSize] = useState(defaultFontSize);
  const [tempFontSize, setTempFontSize] = useState(defaultFontSize);
  const [fontModalVisible, setFontModalVisible] = useState(false);

  return {
    fontSize,
    tempFontSize,
    fontModalVisible,
    setFontSize,
    setTempFontSize,
    setFontModalVisible,
  };
}
