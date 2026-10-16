import { useEffect, useState } from 'react';

// Saniye cinsinden geri sayım. start(30) başlatır, 0'a inene kadar her saniye azalır.
export function useCooldown() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (seconds <= 0) return;
    const id = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [seconds]);

  return { seconds, start: setSeconds };
}