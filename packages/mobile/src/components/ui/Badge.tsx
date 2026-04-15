import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, TYPOGRAPHY, BORDER_RADIUS, SPACING } from '../../constants/theme';

type BadgeVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  dot?: boolean;
  style?: any;
}

export default function Badge({
  label,
  variant = 'default',
  dot = false,
  style
}: BadgeProps) {
  const getBackgroundColor = () => {
    switch (variant) {
      case 'primary':
        return COLORS.primary[100];
      case 'secondary':
        return COLORS.secondary[100];
      case 'success':
        return COLORS.success + '20'; // 20 hex = low opacity
      case 'warning':
        return COLORS.warning + '20';
      case 'error':
        return COLORS.error + '20';
      default:
        return COLORS.gray[100];
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'primary':
        return COLORS.primary[700];
      case 'secondary':
        return COLORS.secondary[700];
      case 'success':
        return COLORS.success;
      case 'warning':
        return COLORS.warning;
      case 'error':
        return COLORS.error;
      default:
        return COLORS.gray[700];
    }
  };

  const getDotColor = () => {
    switch (variant) {
      case 'primary':
        return COLORS.primary[500];
      case 'secondary':
        return COLORS.secondary[500];
      case 'success':
        return COLORS.success;
      case 'warning':
        return COLORS.warning;
      case 'error':
        return COLORS.error;
      default:
        return COLORS.gray[500];
    }
  };

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: getBackgroundColor(),
          borderRadius: BORDER_RADIUS.full
        },
        style
      ]}
    >
      {dot && (
        <View
          style={[
            styles.dot,
            { backgroundColor: getDotColor() }
          ]}
        />
      )}
      <Text
        style={[
          styles.text,
          {
            color: getTextColor(),
            marginLeft: dot ? SPACING.xs : 0
          }
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    alignSelf: 'flex-start'
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3
  },
  text: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.medium
  }
});
