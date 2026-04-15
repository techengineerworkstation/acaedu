'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SpeakerWaveIcon, SpeakerXMarkIcon, PauseIcon, PlayIcon } from '@heroicons/react/24/outline';

interface TextToSpeechButtonProps {
  text: string;
  className?: string;
  buttonSize?: 'sm' | 'md' | 'lg';
}

export default function TextToSpeechButton({ text, className = '', buttonSize = 'md' }: TextToSpeechButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      setIsSupported(false);
      return;
    }

    // Cleanup on unmount
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const speak = useCallback(() => {
    if (!window.speechSynthesis) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9; // Slightly slower for educational content
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };
    utterance.onerror = (event) => {
      console.error('TTS error:', event);
      setIsPlaying(false);
      setIsPaused(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [text]);

  const handleToggle = () => {
    if (isPlaying) {
      if (isPaused) {
        window.speechSynthesis.resume();
        setIsPaused(false);
      } else {
        window.speechSynthesis.pause();
        setIsPaused(true);
      }
    } else {
      speak();
    }
  };

  const handleStop = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setIsPaused(false);
    }
  };

  if (!isSupported) {
    return null; // Don't show button if TTS not supported
  }

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  return (
    <div className={`relative flex items-center ${className}`}>
      <AnimatePresence mode="wait">
        {isPlaying ? (
          <motion.div
            key="playing"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="flex items-center space-x-1"
          >
            {/* Main play/pause button */}
            <button
              onClick={handleToggle}
              className={`${sizeClasses[buttonSize]} flex items-center justify-center rounded-full bg-primary-100 text-primary-600 hover:bg-primary-200 transition-colors`}
              title={isPaused ? 'Resume' : 'Pause'}
            >
              {isPaused ? (
                <PlayIcon className={iconSizes[buttonSize]} />
              ) : (
                <PauseIcon className={iconSizes[buttonSize]} />
              )}
            </button>

            {/* Stop button */}
            <button
              onClick={handleStop}
              className={`${sizeClasses[buttonSize]} flex items-center justify-center rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors`}
              title="Stop"
            >
              <SpeakerXMarkIcon className={iconSizes[buttonSize]} />
            </button>

            {/* Animated sound waves */}
            <div className="flex items-end space-x-0.5 h-4">
              {[0, 1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  className="w-0.5 bg-primary-500 rounded-full"
                  animate={{
                    height: isPaused ? 4 : [4, 12, 8, 16][i % 4],
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    repeatType: 'reverse',
                    delay: i * 0.1
                  }}
                />
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.button
            key="stopped"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={speak}
            className={`${sizeClasses[buttonSize]} flex items-center justify-center rounded-full bg-primary-100 text-primary-600 hover:bg-primary-200 transition-all hover:scale-105`}
            title="Listen to summary"
          >
            <SpeakerWaveIcon className={iconSizes[buttonSize]} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}