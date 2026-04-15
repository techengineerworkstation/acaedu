import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle
} from 'react-native';
import { COLORS, TYPOGRAPHY, BORDER_RADIUS, SPACING } from '../../constants/theme';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
  fullWidth = false
}: ButtonProps) {
  const getBackgroundColor = () => {
    if (disabled) return COLORS.gray[300];
    switch (variant) {
      case 'primary':
        return COLORS.primary[600];
      case 'secondary':
        return COLORS.secondary[500];
      case 'outline':
      case 'ghost':
        return 'transparent';
      case 'danger':
        return COLORS.error;
      default:
        return COLORS.primary[600];
    }
  };

  const getTextColor = () => {
    if (disabled) return COLORS.gray[500];
    switch (variant) {
      case 'outline':
        return COLORS.primary[600];
      case 'ghost':
        return COLORS.gray[700];
      default:
        return 'white';
    }
  };

  const getBorderColor = () => {
    if (disabled) return COLORS.gray[300];
    return variant === 'outline' ? COLORS.primary[600] : 'transparent';
  };

  const getPaddingVertical = () => {
    switch (size) {
      case 'sm':
        return SPACING.sm;
      case 'lg':
        return SPACING.lg;
      default:
        return SPACING.md;
    }
  };

  const getPaddingHorizontal = () => {
    switch (size) {
      case 'sm':
        return SPACING.md;
      case 'lg':
        return SPACING.xl;
      default:
        return SPACING.lg;
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'sm':
        return TYPOGRAPHY.sizes.sm;
      case 'lg':
        return TYPOGRAPHY.sizes.lg;
      default:
        return TYPOGRAPHY.sizes.base;
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || isLoading}
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderWidth: variant === 'outline' ? 1 : 0,
          paddingVertical: getPaddingVertical(),
          paddingHorizontal: getPaddingHorizontal(),
          borderRadius: BORDER_RADIUS.md,
          opacity: disabled ? 0.5 : 1,
          width: fullWidth ? '100%' : undefined
        },
        style
      ]}
      activeOpacity={0.8}
    >
      {isLoading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <>
          {leftIcon && <>{leftIcon}</>}
          <Text
            style={[
              styles.text,
              {
                color: getTextColor(),
                fontSize: getFontSize(),
                fontWeight: TYPOGRAPHY.weights.medium,
                marginLeft: leftIcon ? SPACING.sm : 0,
                marginRight: rightIcon ? SPACING.sm : 0
              },
              textStyle
            ]}
          >
            {title}
          </Text>
          {rightIcon && <>{rightIcon}</>}
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  text: {
    textAlign: 'center'
  }
});
