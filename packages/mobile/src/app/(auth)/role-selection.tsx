import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ROLES, ROLE_LABELS } from '@acadion/shared';
import { Button } from '../../components/ui';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/theme';

export default function RoleSelectionScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Select Your Role</Text>
        <Text style={styles.subtitle}>Choose the role that best describes you</Text>

        <View style={styles.rolesContainer}>
          {Object.values(ROLES).map(role => (
            <TouchableOpacity
              key={role}
              style={styles.roleCard}
              onPress={() => router.push({
                pathname: '/(auth)/register',
                params: { role }
              })}
            >
              <Text style={styles.roleIcon}>
                {role === 'student' ? '🎓' : role === 'lecturer' ? '👨‍🏫' : '⚙️'}
              </Text>
              <Text style={styles.roleName}>{ROLE_LABELS[role]}</Text>
              <Text style={styles.roleDescription}>
                {role === 'student'
                  ? 'Access schedules, notifications, and course materials'
                  : role === 'lecturer'
                  ? 'Manage courses, students, and announcements'
                  : 'Full system control and management'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Button
          title="Back to Login"
          variant="ghost"
          onPress={() => router.back()}
          style={styles.backButton}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  content: {
    flex: 1,
    padding: SPACING.xl,
    justifyContent: 'center'
  },
  title: {
    fontSize: TYPOGRAPHY.sizes['3xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: SPACING.sm
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING['2xl']
  },
  rolesContainer: {
    gap: SPACING.md
  },
  roleCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center'
  },
  roleIcon: {
    fontSize: 48,
    marginBottom: SPACING.md
  },
  roleName: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm
  },
  roleDescription: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    textAlign: 'center'
  },
  backButton: {
    marginTop: SPACING['2xl']
  }
});
