import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, LoadingSpinner } from '../../components/ui';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { BookOpenIcon, UsersIcon, ClipboardDocumentListIcon, BellIcon } from '../../constants/icons';

export default function LecturerDashboardScreen() {
  const [refreshing, setRefreshing] = React.useState(false);

  const { data: coursesData, isLoading: coursesLoading } = useQuery({
    queryKey: ['courses', 'my'],
    queryFn: () => fetch(`${API_BASE_URL}/api/courses?lecturer_id=${user?.id}`).then(r => r.json())
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => setRefreshing(!refreshing)} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Lecturer Dashboard</Text>
          <Text style={styles.subtitle}>Manage your courses and students</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <Card style={styles.statCard} padding="md">
            <BookOpenIcon size={32} color={COLORS.primary[600]} />
            <Text style={styles.statValue}>{coursesData?.data?.length || 0}</Text>
            <Text style={styles.statLabel}>My Courses</Text>
          </Card>

          <Card style={styles.statCard} padding="md">
            <UsersIcon size={32} color={COLORS.secondary[500]} />
            <Text style={styles.statValue}>127</Text>
            <Text style={styles.statLabel}>Students</Text>
          </Card>

          <Card style={styles.statCard} padding="md">
            <ClipboardDocumentListIcon size={32} color={COLORS.warning} />
            <Text style={styles.statValue}>15</Text>
            <Text style={styles.statLabel}>To Grade</Text>
          </Card>

          <Card style={styles.statCard} padding="md">
            <BellIcon size={32} color={COLORS.error} />
            <Text style={styles.statValue}>3</Text>
            <Text style={styles.statLabel}>Announcements</Text>
          </Card>
        </View>

        {/* Quick Actions */}
        <Card style={styles.actionsCard}>
          <CardHeader title="Quick Actions" />
          <View style={styles.actionsGrid}>
            <ActionButton label="Create Announcement" icon="📢" />
            <ActionButton label="Post Assignment" icon="📝" />
            <ActionButton label="Schedule Class" icon="📅" />
            <ActionButton label="View Grades" icon="📊" />
          </View>
        </Card>

        {/* Recent Activity */}
        <Card style={styles.activityCard}>
          <CardHeader title="Recent Activity" />
          <View style={styles.activityList}>
            {[1, 2, 3, 4].map(i => (
              <View key={i} style={styles.activityItem}>
                <View style={[styles.activityDot, { backgroundColor: COLORS.primary[500] }]} />
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>Sample activity {i}</Text>
                  <Text style={styles.activityTime}>{format(new Date(Date.now() - i * 3600000), 'h:mm a')}</Text>
                </View>
              </View>
            ))}
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

function ActionButton({ label, icon }: { label: string; icon: string }) {
  return (
    <TouchableOpacity style={styles.actionButton}>
      <Text style={styles.actionIcon}>{icon}</Text>
      <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
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
  header: {
    marginBottom: SPACING.lg
  },
  greeting: {
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.secondary,
    marginTop: SPACING.xs
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginBottom: SPACING.lg
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: SPACING.lg
  },
  statValue: {
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
    marginVertical: SPACING.sm
  },
  statLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary
  },
  actionsCard: {
    marginBottom: SPACING.lg
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm
  },
  actionButton: {
    alignItems: 'center',
    width: '48%',
    padding: SPACING.md,
    backgroundColor: COLORS.gray[50],
    borderRadius: BORDER_RADIUS.md
  },
  actionIcon: {
    fontSize: 28,
    marginBottom: SPACING.sm
  },
  actionLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.primary,
    textAlign: 'center'
  },
  activityCard: {
    marginBottom: SPACING.lg
  },
  activityList: {
    gap: SPACING.md
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SPACING.md
  },
  activityContent: {
    flex: 1
  },
  activityTitle: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.primary
  },
  activityTime: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.gray[500]
  }
});
