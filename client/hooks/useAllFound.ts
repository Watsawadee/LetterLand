import { useEffect, useState } from "react";

export function useAllFound(allAnswers: string[], foundWordsList: string[]) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const allFound = allAnswers.every((a) => foundWordsList.includes(a));
    if (allFound) {
      const t = setTimeout(() => setVisible(true), 100);
      return () => clearTimeout(t);
    }
  }, [allAnswers, foundWordsList]);
  return { visible, setVisible };
}