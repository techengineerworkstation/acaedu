import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../components/ui';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SCHEDULE_TYPE_COLORS, SCHEDULE_TYPE_LABELS } from '../../constants/theme';
import { format, parseISO, isToday, startOfWeek, addDays, DAYS_OF_WEEK_SHORT } from 'date-fns';

export default function StudentScheduleScreen() {
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Mock schedule data
  const schedule = [
    { id: '1', title: 'CS101 Lecture', start_time: '2024-03-30T09:00:00', end_time: '2024-03-30T10:30:00', location: 'Room 301', schedule_type: 'lecture', course_code: 'CS101' },
    { id: '2', title: 'MATH201 Tutorial', start_time: '2024-03-30T11:00:00', end_time: '2024-03-30T12:00:00', location: 'Room 105', schedule_type: 'tutorial', course_code: 'MATH201' },
    { id: '3', title: 'PHYS101 Lab', start_time: '2024-03-30T14:00:00', end_time: '2024-03-30T16:00:00', location: 'Lab 2', schedule_type: 'lab', course_code: 'PHYS101' }
  ];

  const getTimeFromISO = (iso: string) => {
    const date = parseISO(iso);
    return format(date, 'h:mm a');
  };

  const getDayClasses = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return schedule.filter(s => s.start_time.startsWith(dateStr));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Schedule</Text>

        {/* Week Selector */}
        <View style={styles.weekSelector}>
          {weekDays.map((day, idx) => {
            const dayClasses = getDayClasses(day);
            const isToday = format(day, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
            return (
              <View key={idx} style={styles.dayColumn}>
                <Text style={[styles.dayName, isToday && styles.dayNameActive]}>
                  {DAYS_OF_WEEK_SHORT[day.getDay()]}
                </Text>
                <View style={[styles.dayNumber, isToday && styles.dayNumberActive]}>
                  <Text style={[styles.dayNumberText, isToday && styles.dayNumberTextActive]}>
                    {format(day, 'd')}
                  </Text>
                </View>
                <View style={styles.dayIndicator}>
                  {dayClasses.length > 0 && (
                    <View style={styles.indicatorDot} />
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* Schedule List */}
        <FlatList
          data={schedule}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const start = parseISO(item.start_time);
            const bgColor = SCHEDULE_BG_COLORS[item.schedule_type] || COLORS.gray[100];
            const textColor = SCHEDULE_TEXT_COLORS[item.schedule_type] || COLORS.gray[700];
            const isTodayItem = isToday(start);

            return (
              <Card style={[styles.scheduleCard, { backgroundColor: bgColor }]} padding="md">
                <View style={styles.cardHeader}>
                  <View style={[styles.timeBadge, { backgroundColor: textColor + '20' }]}>
                    <Text style={[styles.timeText, { color: textColor }]}>
                      {getTimeFromISO(item.start_time)} - {getTimeFromISO(item.end_time)}
                    </Text>
                  </View>
                  <Badge label={SCHEDULE_TYPE_LABELS[item.schedule_type]} variant="primary" />
                </View>
                <Text style={[styles.cardTitle, { color: textColor }]}>{item.title}</Text>
                <Text style={[styles.courseCode, { color: textColor }]}>{item.course_code}</Text>
                <View style={styles.locationRow}>
                  <Text style={[styles.locationText, { color: textColor }]}>
                    📍 {item.location}
                  </Text>
                  {isTodayItem && (
                    <Badge label="Today" variant="success" />
                  )}
                </View>
              </Card>
            );
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[50]
  },
  content: {
    flex: 1
  },
  title: {
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
    padding: SPACING.lg,
    paddingBottom: SPACING.sm
  },
  weekSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: SPACING.md
  },
  dayColumn: {
    alignItems: 'center',
    paddingHorizontal: SPACING.xs
  },
  dayName: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs
  },
  dayNameActive: {
    color: COLORS.primary[600],
    fontWeight: TYPOGRAPHY.weights.medium
  },
  dayNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs
  },
  dayNumberActive: {
    backgroundColor: COLORS.primary[600]
  },
  dayNumberText: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.primary
  },
  dayNumberTextActive: {
    color: 'white',
    fontWeight: TYPOGRAPHY.weights.semibold
  },
  dayIndicator: {
    height: 4
  },
  indicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary[600],
    marginTop: 2
  },
  list: {
    padding: SPACING.lg,
    paddingTop: 0
  },
  scheduleCard: {
    marginBottom: SPACING.md,
    borderRadius: BORDER_RADIUS.lg
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm
  },
  timeBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm
  },
  timeText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.medium
  },
  cardTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginBottom: SPACING.xs
  },
  courseCode: {
    fontSize: TYPOGRAPHY.sizes.sm,
    marginBottom: SPACING.xs
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginTop: SPACING.xs
  },
  locationText: {
    fontSize: TYPOGRAPHY.sizes.sm
  }
});
