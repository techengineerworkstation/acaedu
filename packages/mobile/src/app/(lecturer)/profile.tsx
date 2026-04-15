import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../stores/authStore';
import { signOutUser } from '../../services/auth/firebase';
import { authApi } from '../../services/api';
import { Button, Card } from '../../components/ui';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { UserIcon, MailIcon, PhoneIcon, LogoutIcon, SettingsIcon, ChevronRightIcon } from '../../constants/icons';

export default function LecturerProfileScreen() {
  const { user, setUser, setSession } = useAuthStore();

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOutUser();
              await authApi.logout();
              setUser(null);
              setSession(null);
            } catch (error) {
              console.error('Sign out error:', error);
            }
          }
        }
      ]
    );
  };

  const menuItems = [
    { label: 'Edit Profile', icon: '✏️', action: () => {} },
    { label: 'My Courses', icon: '📚', action: () => {} },
    { label: 'Office Hours', icon: '🕐', action: () => {} },
    { label: 'Notification Settings', icon: '🔔', action: () => {} },
    { label: 'Account Security', icon: '🔒', action: () => {} },
    { label: 'Help & Support', icon: '❓', action: () => {} }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.headerCard} padding="lg">
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.full_name?.charAt(0) || 'L'}
            </Text>
          </View>
          <Text style={styles.name}>{user?.full_name || 'Lecturer'}</Text>
          <Text style={styles.role}>Faculty Member</Text>
          <Badge label="Verified" variant="success" style={styles.verifiedBadge} />
        </Card>

        <Card style={styles.infoCard} padding="lg">
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <View style={styles.infoRow}>
            <MailIcon size={20} color={COLORS.gray[500]} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{user?.email || 'Not set'}</Text>
            </View>
          </View>
          {user?.phone && (
            <View style={styles.infoRow}>
              <PhoneIcon size={20} color={COLORS.gray[500]} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Phone</Text>
                <Text style={styles.infoValue}>{user.phone}</Text>
              </View>
            </View>
          )}
          {user?.employee_id && (
            <View style={styles.infoRow}>
              <UserIcon size={20} color={COLORS.gray[500]} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Employee ID</Text>
                <Text style={styles.infoValue}>{user.employee_id}</Text>
              </View>
            </View>
          )}
        </Card>

        <Card style={styles.menuCard} padding="none">
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.menuItem,
                index < menuItems.length - 1 && styles.menuItemBorder
              ]}
              onPress={item.action}
            >
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <ChevronRightIcon size={20} color={COLORS.gray[400]} />
            </TouchableOpacity>
          ))}
        </Card>

        <Button
          title="Sign Out"
          onPress={handleSignOut}
          variant="outline"
          fullWidth
          style={styles.signOutButton}
          leftIcon={<LogoutIcon size={20} color={COLORS.error} />}
        />

        <Text style={styles.version}>Acaedu v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[50]
  },
  content: {
    padding: SPACING.lg
  },
  headerCard: {
    alignItems: 'center',
    marginBottom: SPACING.lg
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.secondary[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md
  },
  avatarText: {
    fontSize: 32,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.secondary[600]
  },
  name: {
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs
  },
  role: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.secondary,
    marginBottom: SPACING.sm
  },
  verifiedBadge: {
    marginTop: SPACING.xs
  },
  infoCard: {
    marginBottom: SPACING.lg
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
    marginBottom: SPACING.lg
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md
  },
  infoContent: {
    marginLeft: SPACING.md,
    flex: 1
  },
  infoLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    marginBottom: 2
  },
  infoValue: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.primary
  },
  menuCard: {
    marginBottom: SPACING.lg
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  menuItemBorder: {},
  menuIcon: {
    fontSize: 24,
    marginRight: SPACING.md
  },
  menuLabel: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.primary
  },
  signOutButton: {
    marginBottom: SPACING.lg,
    borderColor: COLORS.error,
    color: COLORS.error
  },
  version: {
    textAlign: 'center',
    color: COLORS.gray[400],
    fontSize: TYPOGRAPHY.sizes.xs,
    marginTop: SPACING.md
  }
});
