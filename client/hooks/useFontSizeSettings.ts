import { useState } from "react";

export function useFontSizeSettings() {
  const [fontSize, setFontSize] = useState();
  const [tempFontSize, setTempFontSize] = useState();
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
