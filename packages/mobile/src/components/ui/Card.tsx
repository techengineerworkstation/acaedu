import React from 'react';
import { View, ViewStyle, Text, StyleSheet } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: 'sm' | 'md' | 'lg';
  elevation?: 'sm' | 'md' | 'lg' | 'xl';
  bordered?: boolean;
}

export default function Card({
  children,
  style,
  padding = 'md',
  elevation = 'sm',
  bordered = false
}: CardProps) {
  const getPadding = () => {
    switch (padding) {
      case 'sm':
        return SPACING.md;
      case 'lg':
        return SPACING.xl;
      default:
        return SPACING.lg;
    }
  };

  return (
    <View
      style={[
        styles.card,
        {
          padding: getPadding(),
          backgroundColor: COLORS.surface,
          borderRadius: BORDER_RADIUS.lg,
          ...SHADOWS[elevation],
          borderWidth: bordered ? 1 : 0,
          borderColor: COLORS.border
        },
        style
      ]}
    >
      {children}
    </View>
  );
}

export function CardHeader({
  title,
  subtitle,
  rightElement,
  style
}: {
  title: string;
  subtitle?: string;
  rightElement?: React.ReactNode;
  style?: any;
}) {
  return (
    <View style={[styles.cardHeader, style]}>
      <View style={styles.headerText}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {rightElement && <View style={styles.headerRight}>{rightElement}</View>}
    </View>
  );
}

export function CardContent({
  children,
  style
}: {
  children: React.ReactNode;
  style?: any;
}) {
  return <View style={[styles.cardContent, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    marginBottom: SPACING.md
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md
  },
  headerText: {
    flex: 1
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    marginTop: SPACING.xs
  },
  headerRight: {
    marginLeft: SPACING.md
  },
  cardContent: {
    // Add your content styling
  }
});
