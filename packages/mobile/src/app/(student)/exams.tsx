import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Badge, LoadingSpinner, EmptyState } from '../../components/ui';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { CalendarIcon, ClockIcon, MapPinIcon } from '../../constants/icons';
import { format, parseISO } from 'date-fns';

export default function StudentExamsScreen() {
  const exams = [
    {
      id: '1',
      title: 'Midterm Exam - CS101',
      course_code: 'CS101',
      exam_date: '2024-04-15T09:00:00',
      duration_minutes: 120,
      location: 'Room 301',
      total_marks: 100
    },
    {
      id: '2',
      title: 'Final Exam - MATH201',
      course_code: 'MATH201',
      exam_date: '2024-05-20T14:00:00',
      duration_minutes: 180,
      location: 'Auditorium A',
      total_marks: 150
    }
  ];

  const getDaysUntil = (dateString: string) => {
    const examDate = parseISO(dateString);
    const today = new Date();
    const diffTime = examDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const renderExam = ({ item }: { item: any }) => {
    const daysUntil = getDaysUntil(item.exam_date);
    const examDate = parseISO(item.exam_date);
    const isUpcoming = daysUntil > 0;
    const isUrgent = daysUntil <= 7 && daysUntil > 0;
    const isPast = daysUntil <= 0;

    return (
      <Card style={styles.examCard} padding="lg">
        <View style={styles.cardHeader}>
          <Text style={styles.examTitle}>{item.title}</Text>
          <Badge
            label={
              isPast ? 'Completed' :
              isUrgent ? 'Soon' : 'Upcoming'
            }
            variant={
              isPast ? 'default' :
              isUrgent ? 'error' : 'primary'
            }
          />
        </View>

        <View style={styles.examDetails}>
          <View style={styles.detailRow}>
            <CalendarIcon size={18} color={COLORS.gray[500]} />
            <Text style={styles.detailText}>
              {format(examDate, 'EEEE, MMM d, yyyy')}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <ClockIcon size={18} color={COLORS.gray[500]} />
            <Text style={styles.detailText}>
              {format(examDate, 'h:mm a')} • {item.duration_minutes} min
              {' '}• {item.total_marks} marks
            </Text>
          </View>

          <View style={styles.detailRow}>
            <MapPinIcon size={18} color={COLORS.gray[500]} />
            <Text style={styles.detailText}>{item.location}</Text>
          </View>
        </View>

        {isUpcoming && (
          <View style={styles.countdownContainer}>
            <Text style={styles.countdownLabel}>
              {daysUntil === 1 ? 'Tomorrow' :
               daysUntil === 0 ? 'Today' :
               `${daysUntil} days`}
            </Text>
            <Text style={styles.countdownSubtext}>until exam</Text>
          </View>
        )}
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Exams</Text>

        <FlatList
          data={exams}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={renderExam}
          ListEmptyComponent={
            <EmptyState
              icon={<CalendarIcon size={64} color={COLORS.gray[400]} />}
              title="No Exams Scheduled"
              message="Check back later for exam updates"
            />
          }
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
  list: {
    padding: SPACING.lg,
    paddingTop: 0
  },
  examCard: {
    marginBottom: SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md
  },
  examTitle: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
    marginRight: SPACING.sm
  },
  examDetails: {
    gap: SPACING.sm
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm
  },
  detailText: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.secondary
  },
  countdownContainer: {
    marginTop: SPACING.md,
    padding: SPACING.md,
    backgroundColor: COLORS.warning + '20',
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center'
  },
  countdownLabel: {
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.warning
  },
  countdownSubtext: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary
  }
});
