import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, LoadingSpinner, Badge } from '../../components/ui';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { UserIcon, BookOpenIcon, CalendarIcon, BellIcon, CreditCardIcon } from '../../constants/icons';

export default function AdminDashboardScreen() {
  const [refreshing, setRefreshing] = React.useState(false);

  const { data: statsData, isLoading } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      // Would call actual API endpoints
      return {
        totalUsers: 1234,
        totalCourses: 48,
        totalRevenue: 12345,
        notificationsSent: 567
      };
    }
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
          <Text style={styles.greeting}>Admin Dashboard</Text>
          <Text style={styles.subtitle}>System overview & management</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsGrid}>
          <StatCard
            label="Total Users"
            value={statsData?.totalUsers || 0}
            icon={<UserIcon size={24} color={COLORS.primary[600]} />}
            color={COLORS.primary[600]}
          />
          <StatCard
            label="Courses"
            value={statsData?.totalCourses || 0}
            icon={<BookOpenIcon size={24} color={COLORS.secondary[500]} />}
            color={COLORS.secondary[500]}
          />
          <StatCard
            label="Schedules"
            value={156}
            icon={<CalendarIcon size={24} color={COLORS.warning} />}
            color={COLORS.warning}
          />
          <StatCard
            label="Revenue"
            value={`$${(statsData?.totalRevenue || 0).toLocaleString()}`}
            icon={<CreditCardIcon size={24} color={COLORS.success} />}
            color={COLORS.success}
          />
        </View>

        {/* Quick Actions */}
        <Card style={styles.actionsCard}>
          <CardHeader title="Quick Actions" />
          <View style={styles.actionsGrid}>
            <AdminActionButton label="Create User" icon="👤" color={COLORS.primary[100]} />
            <AdminActionButton label="Add Course" icon="➕" color={COLORS.secondary[100]} />
            <AdminActionButton label="Broadcast" icon="📢" color={COLORS.warning + '20'} />
            <AdminActionButton label="Reports" icon="📊" color={COLORS.error + '20'} />
            <AdminActionButton label="Manage Billing" icon="💳" color={COLORS.success + '20'} />
            <AdminActionButton label="System Logs" icon="🔍" color={COLORS.gray[200]} />
          </View>
        </Card>

        {/* Recent Activity */}
        <Card style={styles.activityCard}>
          <CardHeader title="Recent System Activity" />
          <View style={styles.activityList}>
            {[
              { action: 'New user registered', user: 'john@uni.edu', time: '2 min ago' },
              { action: 'Announcement published', user: 'Dr. Smith', time: '15 min ago' },
              { action: 'Payment received', user: '$9.99 - Jane', time: '1 hour ago' },
              { action: 'Course created', user: 'CS301 added', time: '3 hours ago' }
            ].map((activity, idx) => (
              <View key={idx} style={styles.activityItem}>
                <View style={[styles.activityDot, { backgroundColor: COLORS.primary[500] }]} />
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>{activity.action}</Text>
                  <Text style={styles.activityMeta}>{activity.user} • {activity.time}</Text>
                </View>
                <Badge label="new" variant="primary" dot />
              </View>
            ))}
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({
  label,
  value,
  icon,
  color
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <Card style={[styles.statCard, { borderLeftWidth: 4, borderLeftColor: color }]} padding="md">
      {icon}
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Card>
  );
}

function AdminActionButton({
  label,
  icon,
  color
}: {
  label: string;
  icon: string;
  color: string;
}) {
  return (
    <TouchableOpacity style={[styles.actionButton, { backgroundColor: color }]}>
      <Text style={styles.actionIcon}>{icon}</Text>
      <Text style={[styles.actionLabel, { color: COLORS.gray[700] }]}>{label}</Text>
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
  statsGrid: {
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
    width: '30%',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md
  },
  actionIcon: {
    fontSize: 28,
    marginBottom: SPACING.sm
  },
  actionLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
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
  activityMeta: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.gray[500],
    marginTop: 2
  }
});
