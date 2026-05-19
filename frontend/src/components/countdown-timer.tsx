import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface TimeLeft {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const targetDate = new Date();
targetDate.setFullYear(targetDate.getFullYear() + 5);
targetDate.setMonth(targetDate.getMonth() + 3);
targetDate.setDate(targetDate.getDate() + 14);

export function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +targetDate - +new Date();
      if (difference > 0) {
        setTimeLeft({
          years: Math.floor(difference / (1000 * 60 * 60 * 24 * 365)),
          months: Math.floor((difference / (1000 * 60 * 60 * 24 * 30.44)) % 12),
          days: Math.floor((difference / (1000 * 60 * 60 * 24)) % 30.44),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, []);

  const timeBlocks = [
    { label: 'Years', value: timeLeft.years },
    { label: 'Months', value: timeLeft.months },
    { label: 'Days', value: timeLeft.days },
    { label: 'Hrs', value: timeLeft.hours },
    { label: 'Min', value: timeLeft.minutes },
    { label: 'Sec', value: timeLeft.seconds }
  ]

  return (
    <div className="flex flex-wrap justify-center items-center gap-2 md:gap-4 bg-white/70 backdrop-blur-2xl border border-black/5 p-6 md:p-8 rounded-[2.5rem] shadow-xl relative">
      <div className="absolute -top-3 md:-top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-brand text-white rounded-full text-[10px] md:text-xs font-semibold tracking-wide shadow-md">
         Capsule Opening
      </div>
      {timeBlocks.map((block, idx) => (
        <React.Fragment key={block.label}>
          <div className="flex flex-col items-center min-w-[50px] md:min-w-[70px]">
            <div className="h-12 md:h-16 overflow-hidden relative w-full text-center">
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={block.value}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="absolute inset-0 flex justify-center items-center text-3xl md:text-5xl font-medium tracking-tight text-ink"
                >
                  {String(block.value).padStart(2, '0')}
                </motion.span>
              </AnimatePresence>
            </div>
            <span className="text-[10px] md:text-sm font-medium text-ink-muted mt-1 md:mt-2">
              {block.label}
            </span>
          </div>
          {idx < timeBlocks.length - 1 && (
            <div className="hidden md:block text-2xl md:text-4xl font-light text-black/10 pb-6 md:pb-8">:</div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
