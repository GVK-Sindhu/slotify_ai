import { useState, useEffect } from 'react';

export interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
  formatted: string;
}

export const useCountdown = (targetDateStr: string, endTimeStr?: string): CountdownTime => {
  const calculateTimeLeft = (): CountdownTime => {
    // Combine Date and Time if both provided, otherwise parse targetDateStr
    let targetTime = new Date(targetDateStr).getTime();
    if (endTimeStr && targetDateStr) {
      const combinedStr = `${targetDateStr.split('T')[0]}T${endTimeStr}`;
      targetTime = new Date(combinedStr).getTime();
    }

    const difference = targetTime - new Date().getTime();
    
    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true, formatted: 'Expired' };
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((difference / 1000 / 60) % 60);
    const seconds = Math.floor((difference / 1000) % 60);

    const parts: string[] = [];
    if (days > 0) parts.push(`${days}d`);
    parts.push(`${hours.toString().padStart(2, '0')}h`);
    parts.push(`${minutes.toString().padStart(2, '0')}m`);
    parts.push(`${seconds.toString().padStart(2, '0')}s`);

    return {
      days,
      hours,
      minutes,
      seconds,
      isExpired: false,
      formatted: parts.join(' ')
    };
  };

  const [timeLeft, setTimeLeft] = useState<CountdownTime>(calculateTimeLeft);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDateStr, endTimeStr]);

  return timeLeft;
};
