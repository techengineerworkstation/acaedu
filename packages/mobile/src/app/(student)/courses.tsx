import React from 'react';
import { View, Text, ScrollView, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Card, Badge, LoadingSpinner, EmptyState } from '../../components/ui';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { BookOpenIcon, UsersIcon, ClockIcon, SpeakerWaveIcon } from '../../constants/icons';
import TextToSpeechButton from '../../components/tts/TextToSpeechButton';

export default function StudentCoursesScreen() {
  const { data, isLoading } = useQuery({
    queryKey: ['courses', 'enrolled'],
    queryFn: async () => {
      // Would fetch from API
      return {
        data: [
          {
            id: '1',
            course_code: 'CS101',
            title: 'Introduction to Computer Science',
            description: 'Basic programming concepts and computational thinking',
            summary: 'Learn programming fundamentals using Python and Java. Build problem-solving skills essential for software development career.',
            credits: 3,
            lecturer: { full_name: 'Dr. Sarah Johnson' },
            enrolled_count: 35,
            capacity: 40
          },
          {
            id: '2',
            course_code: 'MATH201',
            title: 'Calculus II',
            description: 'Advanced calculus including integration and series',
            summary: 'Master advanced integration techniques, infinite series, and introductory differential equations for engineering and science applications.',
            credits: 4,
            lecturer: { full_name: 'Prof. Michael Chen' },
            enrolled_count: 28,
            capacity: 35
          },
          {
            id: '3',
            course_code: 'PHYS101',
            title: 'General Physics',
            description: 'Fundamentals of mechanics and thermodynamics',
            summary: 'Explore classical mechanics, thermodynamics, and waves through both theory and hands-on laboratory experiments.',
            credits: 4,
            lecturer: { full_name: 'Dr. Emily Rodriguez' },
            enrolled_count: 32,
            capacity: 40
          }
        ]
      };
    }
  });

  const courses = data?.data || [];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>My Courses</Text>

        {isLoading ? (
          <LoadingSpinner fullScreen />
        ) : courses.length > 0 ? (
          <FlatList
            data={courses}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <Card style={styles.courseCard} padding="lg">
                <View style={styles.courseHeader}>
                  <Text style={styles.courseCode}>{item.course_code}</Text>
                  <Badge label={`${item.credits} credits`} variant="primary" />
                </View>
                <Text style={styles.courseTitle}>{item.title}</Text>
                <Text style={styles.courseDescription} numberOfLines={2}>
                  {item.description}
                </Text>

                {/* Course Summary Section with TTS */}
                {item.summary && (
                  <View style={styles.summarySection}>
                    <View style={styles.summaryHeader}>
                      <Text style={styles.summaryLabel}>Course Preview</Text>
                      <TextToSpeechButton text={item.summary} buttonSize="sm" />
                    </View>
                    <Text style={styles.summaryText} numberOfLines={3}>
                      {item.summary}
                    </Text>
                  </View>
                )}

                <View style={styles.courseFooter}>
                  <View style={styles.footerItem}>
                    <UsersIcon size={16} color={COLORS.gray[500]} />
                    <Text style={styles.footerText}>
                      {item.enrolled_count}/{item.capacity} enrolled
                    </Text>
                  </View>
                  <View style={styles.footerItem}>
                    <BookOpenIcon size={16} color={COLORS.gray[500]} />
                    <Text style={styles.footerText}>
                      {item.lecturer?.full_name}
                    </Text>
                  </View>
                </View>
              </Card>
            )}
          />
        ) : (
          <EmptyState
            icon={<BookOpenIcon size={64} color={COLORS.gray[400]} />}
            title="No Enrolled Courses"
            message="You haven't enrolled in any courses yet"
            actionLabel="Browse Courses"
            onAction={() => {}}
          />
        )}
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
  title: {
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.lg
  },
  courseCard: {
    marginBottom: SPACING.md
  },
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm
  },
  courseCode: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary[600]
  },
  courseTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm
  },
  courseDescription: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.secondary,
    lineHeight: TYPOGRAPHY.lineHeights.normal,
    marginBottom: SPACING.md
  },
  summarySection: {
    backgroundColor: '#fef3c7',
    borderLeftWidth: 3,
    borderLeftColor: '#d97706',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm
  },
  summaryLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: '#92400e'
  },
  summaryText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: '#78350f',
    lineHeight: TYPOGRAPHY.lineHeights.normal
  },
  courseFooter: {
    flexDirection: 'row',
    gap: SPACING.lg
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs
  },
  footerText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary
  }
});
