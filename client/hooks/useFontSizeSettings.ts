import { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getLoggedInUserId } from "@/utils/auth";

const DEFAULT_FONT_SIZE = 32;
const KEY_PREFIX = "ll:fontSize:v1:";

function toKey(uid: string | number | null | undefined) {
  return KEY_PREFIX + (uid ? String(uid) : "anon");
}

export function useFontSizeSettings() {
  const [fontSize, setFontSizeState] = useState<number>(DEFAULT_FONT_SIZE);
  const [tempFontSize, setTempFontSize] = useState<number>(DEFAULT_FONT_SIZE);
  const [fontModalVisible, setFontModalVisible] = useState(false);
  const [storageKey, setStorageKey] = useState<string>(toKey(null));

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const uid = await getLoggedInUserId().catch(() => null);
        const key = toKey(uid);
        if (cancelled) return;
        setStorageKey(key);

        const saved = await AsyncStorage.getItem(key);
        const n = Number(saved);
        if (saved != null && Number.isFinite(n) && n > 8 && n < 200) {
          setFontSizeState(n);
          setTempFontSize(n);
        }
      } catch {}
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const setFontSize = useCallback(
    (n: number) => {
      setFontSizeState(n);
      setTempFontSize(n);
      AsyncStorage.setItem(storageKey, String(n)).catch(() => {});
    },
    [storageKey]
  );

  return {
    fontSize,
    fontModalVisible,
    setFontModalVisible,
    tempFontSize,
    setTempFontSize,
    setFontSize,
  };
}

export default useFontSizeSettings;
