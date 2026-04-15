'use client';

import { useCallback, useRef } from 'react';

interface UseSoundOptions {
  volume?: number;
  enabled?: boolean;
}

export function useSoundEffects(options: UseSoundOptions = {}) {
  const { volume = 0.3, enabled = true } = options;
  const audioContextRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    if (typeof window === 'undefined') return null;
    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch {
        return null;
      }
    }
    return audioContextRef.current!;
  }, []);

  const playClick = useCallback(() => {
    if (!enabled) return;
    
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(800, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.05);
      
      gainNode.gain.setValueAtTime(volume, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.1);
    } catch (e) {
      console.warn('Audio not supported');
    }
  }, [enabled, volume, getAudioContext]);

  const playSuccess = useCallback(() => {
    if (!enabled) return;
    
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      oscillator.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
      oscillator.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
      
      gainNode.gain.setValueAtTime(volume, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.3);
    } catch (e) {
      console.warn('Audio not supported');
    }
  }, [enabled, volume, getAudioContext]);

  const playError = useCallback(() => {
    if (!enabled) return;
    
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(200, ctx.currentTime);
      oscillator.frequency.setValueAtTime(150, ctx.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(volume, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.2);
    } catch (e) {
      console.warn('Audio not supported');
    }
  }, [enabled, volume, getAudioContext]);

  const playHover = useCallback(() => {
    if (!enabled) return;
    
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(600, ctx.currentTime);
      
      gainNode.gain.setValueAtTime(volume * 0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.05);
    } catch (e) {
      console.warn('Audio not supported');
    }
  }, [enabled, volume, getAudioContext]);

  const playNotification = useCallback(() => {
    if (!enabled) return;
    
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, ctx.currentTime);
      oscillator.frequency.setValueAtTime(1108.73, ctx.currentTime + 0.15);
      oscillator.frequency.setValueAtTime(1318.51, ctx.currentTime + 0.3);
      
      gainNode.gain.setValueAtTime(volume, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.4);
    } catch (e) {
      console.warn('Audio not supported');
    }
  }, [enabled, volume, getAudioContext]);

  return {
    playClick,
    playSuccess,
    playError,
    playHover,
    playNotification,
  };
}

// Hook for integrating with button component
export function useSoundButton() {
  const { playClick, playSuccess, playError } = useSoundEffects();
  
  const onClick = useCallback(() => {
    playClick();
  }, [playClick]);

  return { onClick, playSuccess, playError };
}
