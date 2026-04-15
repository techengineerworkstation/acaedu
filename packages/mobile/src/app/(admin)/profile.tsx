import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../stores/authStore';
import { signOutUser } from '../../services/auth/firebase';
import { authApi } from '../../services/api';
import { Button, Card } from '../../components/ui';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { UserIcon, MailIcon, ShieldIcon, SettingsIcon, LogoutIcon, ChevronRightIcon } from '../../constants/icons';

export default function AdminProfileScreen() {
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
    { label: 'Account Settings', icon: '⚙️', action: () => {} },
    { label: 'Security', icon: '🔒', action: () => {} },
    { label: 'System Logs', icon: '📋', action: () => {} },
    { label: 'API Keys', icon: '🔑', action: () => {} },
    { label: 'Notifications', icon: '🔔', action: () => {} },
    { label: 'Help & Support', icon: '❓', action: () => {} }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.headerCard} padding="lg">
          <View style={[styles.avatar, { backgroundColor: COLORS.error + '20' }]}>
            <Text style={[styles.avatarText, { color: COLORS.error }]}>A</Text>
          </View>
          <Text style={styles.name}>{user?.full_name || 'Administrator'}</Text>
          <Text style={styles.role}>System Administrator</Text>
          <Badge label="Super Admin" variant="primary" style={styles.verifiedBadge} />
        </Card>

        <Card style={styles.permissionsCard} padding="lg">
          <Text style={styles.sectionTitle}>Permissions</Text>
          <View style={styles.permissionRow}>
            <ShieldIcon size={16} color={COLORS.success} />
            <Text style={styles.permissionText}>Full system access</Text>
          </View>
          <View style={styles.permissionRow}>
            <Text style={styles.permissionCheck}>✓</Text>
            <Text style={styles.permissionText}>Manage all users</Text>
          </View>
          <View style={styles.permissionRow}>
            <Text style={styles.permissionCheck}>✓</Text>
            <Text style={styles.permissionText}>Full billing access</Text>
          </View>
          <View style={styles.permissionRow}>
            <Text style={styles.permissionCheck}>✓</Text>
            <Text style={styles.permissionText}>Broadcast announcements</Text>
          </View>
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

        <Text style={styles.version}>Acaedu Admin v1.0.0</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md
  },
  avatarText: {
    fontSize: 32,
    fontWeight: TYPOGRAPHY.weights.bold
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
  permissionsCard: {
    marginBottom: SPACING.lg
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
    marginBottom: SPACING.md
  },
  permissionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm
  },
  permissionCheck: {
    marginRight: SPACING.sm,
    color: COLORS.success,
    fontWeight: TYPOGRAPHY.weights.bold
  },
  permissionText: {
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
    borderColor: COLORS.error
  },
  version: {
    textAlign: 'center',
    color: COLORS.gray[400],
    fontSize: TYPOGRAPHY.sizes.xs,
    marginTop: SPACING.md
  }
});
