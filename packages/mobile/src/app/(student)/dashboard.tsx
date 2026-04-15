import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format, startOfWeek, addDays, isToday } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../stores/authStore';
import { coursesApi, schedulesApi, notificationsApi } from '../../services/api';
import { Card, CardHeader, Badge, LoadingSpinner, EmptyState } from '../../components/ui';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SCHEDULE_TYPE_COLORS, SCHEDULE_TYPE_LABELS } from '../../constants/theme';
import { DAYS_OF_WEEK_SHORT } from '@acadion/shared';
import { CalendarIcon, BellIcon, BookOpenIcon, ClockIcon } from '../../constants/icons';

export default function StudentDashboardScreen() {
  const { user } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);

  const { data: coursesData, isLoading: coursesLoading } = useQuery({
    queryKey: ['courses', 'enrolled'],
    queryFn: () => coursesApi.getAll({ enrolled_only: true }) // Add this param to API
  });

  const { data: schedulesData, isLoading: schedulesLoading } = useQuery({
    queryKey: ['schedules', 'today'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const tomorrow = addDays(new Date(), 1).toISOString().split('T')[0];
      return schedulesApi.getAll({ start_date: today, end_date: tomorrow });
    }
  });

  const { data: notificationsData } = useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn: () => notificationsApi.getAll({ unread_only: true, limit: 5 })
  });

  const onRefresh = async () => {
    setRefreshing(true);
    // Reload queries
    setRefreshing(false);
  };

  const todaysClasses = schedulesData?.data?.filter((s: any) => {
    const scheduleDate = new Date(s.start_time).toDateString();
    return scheduleDate === new Date().toDateString();
  }) || [];

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const stats = [
    {
      label: 'Enrolled',
      value: coursesData?.data?.length || 0,
      icon: BookOpenIcon,
      color: COLORS.primary[500]
    },
    {
      label: "Today's Classes",
      value: todaysClasses.length,
      icon: ClockIcon,
      color: COLORS.secondary[500]
    },
    {
      label: 'Notifications',
      value: notificationsData?.data?.length || 0,
      icon: BellIcon,
      color: COLORS.warning
    },
    {
      label: 'Upcoming Exams',
      value: 2, // placeholder - would fetch from exams API
      icon: CalendarIcon,
      color: COLORS.error
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>
            Hello, {user?.full_name?.split(' ')[0] || 'Student'}!
          </Text>
          <Text style={styles.date}>
            {format(new Date(), 'EEEE, MMM d, yyyy')}
          </Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {stats.map((stat, idx) => (
            <Card key={idx} style={styles.statCard} padding="md">
              <View style={styles.statHeader}>
                <stat.icon style={{ color: stat.color }} />
                <Text style={styles.statValue}>{stat.value}</Text>
              </View>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </Card>
          ))}
        </View>

        {/* Today's Schedule */}
        <Card style={styles.sectionCard}>
          <CardHeader
            title="Today's Classes"
            subtitle={todaysClasses.length > 0 ? `${todaysClasses.length} scheduled` : 'No classes today'}
          />

          {schedulesLoading ? (
            <LoadingSpinner />
          ) : todaysClasses.length > 0 ? (
            <View style={styles.scheduleList}>
              {todaysClasses.map((item: any) => {
                const start = new Date(item.start_time);
                const end = new Date(item.end_time);
                const timeRange = `${format(start, 'h:mm a')} - ${format(end, 'h:mm a')}`;
                const bgColor = SCHEDULE_BG_COLORS[item.schedule_type] || COLORS.gray[100];
                const textColor = SCHEDULE_TEXT_COLORS[item.schedule_type] || COLORS.gray[700];

                return (
                  <View key={item.id} style={[styles.classItem, { backgroundColor: bgColor }]}>
                    <View style={[styles.classTimeBadge, { backgroundColor: textColor + '20' }]}>
                      <Text style={[styles.classTime, { color: textColor }]}>
                        {timeRange}
                      </Text>
                    </View>
                    <View style={styles.classInfo}>
                      <Text style={[styles.classTitle, { color: textColor }]}>
                        {item.title}
                      </Text>
                      <Text style={[styles.classCourse, { color: textColor }]}>
                        {item.course?.course_code}
                      </Text>
                      {item.location && (
                        <Text style={[styles.classLocation, { color: textColor }]}>
                          📍 {item.location}
                        </Text>
                      )}
                    </View>
                    <Badge label={SCHEDULE_TYPE_LABELS[item.schedule_type]} />
                  </View>
                );
              })}
            </View>
          ) : (
            <EmptyState
              icon={<CalendarIcon size={48} color={COLORS.gray[400]} />}
              title="No Classes Today"
              message="Enjoy your day off!"
            />
          )}
        </Card>

        {/* This Week */}
        <Card style={styles.sectionCard}>
          <CardHeader title="This Week" />
          <View style={styles.weekGrid}>
            {weekDays.map((day, idx) => (
              <View key={idx} style={styles.weekDay}>
                <Text style={styles.weekDayName}>
                  {DAYS_OF_WEEK_SHORT[day.getDay()]}
                </Text>
                <Text style={[
                  styles.weekDayNumber,
                  isToday(day) && styles.weekDayNumberActive
                ]}>
                  {format(day, 'd')}
                </Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Quick Links */}
        <Card style={styles.sectionCard}>
          <CardHeader title="Quick Actions" />
          <View style={styles.quickLinks}>
            <TouchableOpacity style={styles.quickLink}>
              <Text style={styles.quickLinkIcon}>📝</Text>
              <Text style={styles.quickLinkText}>Assignments</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickLink}>
              <Text style={styles.quickLinkIcon}>📊</Text>
              <Text style={styles.quickLinkText}>Grades</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickLink}>
              <Text style={styles.quickLinkIcon}>📢</Text>
              <Text style={styles.quickLinkText}>Announcements</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickLink}>
              <Text style={styles.quickLinkIcon}>📅</Text>
              <Text style={styles.quickLinkText}>Exams</Text>
            </TouchableOpacity>
          </View>
        </Card>
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
  header: {
    marginBottom: SPACING.lg
  },
  greeting: {
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary
  },
  date: {
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
    marginBottom: 0
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm
  },
  // icon component - just a placeholder
  icon: {
    fontSize: 24,
    marginRight: SPACING.sm
  },
  statValue: {
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
    marginLeft: 'auto'
  },
  statLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary
  },
  sectionCard: {
    marginBottom: SPACING.lg
  },
  scheduleList: {
    gap: SPACING.sm
  },
  classItem: {
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    flexDirection: 'row',
    alignItems: 'center'
  },
  classTimeBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    marginRight: SPACING.md
  },
  classTime: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.medium
  },
  classInfo: {
    flex: 1
  },
  classTitle: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginBottom: SPACING.xs
  },
  classCourse: {
    fontSize: TYPOGRAPHY.sizes.sm,
    marginBottom: 2
  },
  classLocation: {
    fontSize: TYPOGRAPHY.sizes.xs,
    opacity: 0.8
  },
  weekGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  weekDay: {
    alignItems: 'center',
    padding: SPACING.sm
  },
  weekDayName: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs
  },
  weekDayNumber: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.text.primary
  },
  weekDayNumberActive: {
    backgroundColor: COLORS.primary[600],
    color: 'white',
    width: 36,
    height: 36,
    borderRadius: 18,
    textAlign: 'center',
    textAlignVertical: 'center',
    lineHeight: 36
  },
  quickLinks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md
  },
  quickLink: {
    alignItems: 'center',
    width: '23%',
    padding: SPACING.md,
    backgroundColor: COLORS.gray[50],
    borderRadius: BORDER_RADIUS.md
  },
  quickLinkIcon: {
    fontSize: 28,
    marginBottom: SPACING.xs
  },
  quickLinkText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.secondary,
    textAlign: 'center'
  }
});
