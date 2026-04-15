import React, { useState, useEffect, useCallback } from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { useTheme } from '../providers/ThemeProvider';

interface TextToSpeechButtonProps {
  text: string;
  buttonSize?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  label?: string;
}

export default function TextToSpeechButton({
  text,
  buttonSize = 'md',
  showLabel = false,
  label = 'Listen'
}: TextToSpeechButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const { colors } = useTheme();

  useEffect(() => {
    if (typeof window !== 'undefined' && !('speechSynthesis' in window)) {
      setIsSupported(false);
    }
  }, []);

  const speak = useCallback(() => {
    if (!text || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    utterance.pitch = 1;

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };
    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

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

  if (!isSupported || !text) return null;

  const sizeConfig = {
    sm: { button: 32, icon: 14, iconContainer: 14, textSize: 11 },
    md: { button: 40, icon: 18, iconContainer: 18, textSize: 12 },
    lg: { button: 48, icon: 22, iconContainer: 22, textSize: 14 }
  };

  const size = sizeConfig[buttonSize];

  if (isPlaying) {
    return (
      <View style={styles.playingContainer}>
        <TouchableOpacity
          onPress={handleToggle}
          style={[styles.controlButton, { backgroundColor: colors.primary[100], width: size.button, height: size.button, borderRadius: size.button / 2 }]}
        >
          <Text style={{ fontSize: size.icon, color: colors.primary[600] }}>
            {isPaused ? '▶️' : '⏸️'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleStop}
          style={[styles.controlButton, { backgroundColor: colors.error + '20', width: size.button, height: size.button, borderRadius: size.button / 2, marginLeft: 8 }]}
        >
          <Text style={{ fontSize: size.icon, color: colors.error }}>
            ⏹️
          </Text>
        </TouchableOpacity>
        {showLabel && (
          <Text style={[styles.label, { fontSize: size.textSize }]}>
            {isPaused ? 'Resuming...' : 'Playing...'}
          </Text>
        )}
      </View>
    );
  }

  return (
    <TouchableOpacity
      onPress={speak}
      style={[styles.button, { backgroundColor: colors.primary[100], width: showLabel ? 'auto' : size.button, height: size.button, borderRadius: size.button / 2, paddingHorizontal: showLabel ? 12 : 0 }]}
    >
      <Text style={{ fontSize: showLabel ? 14 : size.icon, color: colors.primary[600], fontWeight: showLabel ? '600' : 'normal' }}>
        {showLabel ? `🔊 ${label}` : '🔊'}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 4
  },
  playingContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  controlButton: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  label: {
    marginLeft: 8,
    color: '#666',
    fontWeight: '500'
  }
});
