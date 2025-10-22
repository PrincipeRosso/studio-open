'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

interface TypewriterTextProps {
  className?: string;
  speed?: number;
  pauseDuration?: number;
  loop?: boolean;
}

export function TypewriterText({ 
  className = '', 
  speed = 100, 
  pauseDuration = 2000,
  loop = true 
}: TypewriterTextProps) {
  const t = useTranslations('typewriter');
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [charIndex, setCharIndex] = useState(0);

  // Ottieni i testi dalle traduzioni
  const texts = t.raw('texts') as string[];

  useEffect(() => {
    if (texts.length === 0) return;

    const currentFullText = texts[currentTextIndex];
    
    if (isTyping) {
      if (charIndex < currentFullText.length) {
        const timer = setTimeout(() => {
          setCurrentText(currentFullText.slice(0, charIndex + 1));
          setCharIndex(charIndex + 1);
        }, speed);
        return () => clearTimeout(timer);
      } else {
        // Testo completato, pausa prima di cancellare
        const timer = setTimeout(() => {
          setIsTyping(false);
        }, pauseDuration);
        return () => clearTimeout(timer);
      }
    } else {
      // Cancellazione del testo
      if (charIndex > 0) {
        const timer = setTimeout(() => {
          setCurrentText(currentFullText.slice(0, charIndex - 1));
          setCharIndex(charIndex - 1);
        }, speed / 2); // Cancellazione più veloce
        return () => clearTimeout(timer);
      } else {
        // Testo cancellato, passa al prossimo
        const nextIndex = (currentTextIndex + 1) % texts.length;
        if (loop || nextIndex !== 0) {
          setCurrentTextIndex(nextIndex);
          setIsTyping(true);
        }
      }
    }
  }, [charIndex, currentTextIndex, isTyping, texts, speed, pauseDuration, loop]);

  if (texts.length === 0) {
    return null;
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <h2 className="text-3xl font-normal text-gray-700 dark:text-gray-300 text-center min-h-[3rem] flex items-center">
        {currentText}
        <span className="ml-1 animate-pulse text-gray-600 dark:text-gray-400">|</span>
      </h2>
    </div>
  );
}