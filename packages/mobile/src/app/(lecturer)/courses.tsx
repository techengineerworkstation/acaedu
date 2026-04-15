import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Badge, LoadingSpinner } from '../../components/ui';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { BookOpenIcon, UsersIcon, PlusIcon } from '../../constants/icons';

export default function LecturerCoursesScreen() {
  const courses = [
    {
      id: '1',
      course_code: 'CS101',
      title: 'Introduction to Computer Science',
      enrolled_count: 35,
      capacity: 40
    },
    {
      id: '2',
      course_code: 'CS301',
      title: 'Data Structures & Algorithms',
      enrolled_count: 28,
      capacity: 30
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>My Courses</Text>
          <TouchableOpacity style={styles.addButton}>
            <PlusIcon size={24} color={COLORS.primary[600]} />
          </TouchableOpacity>
        </View>

        <FlatList
          data={courses}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Card style={styles.courseCard} padding="lg">
              <View style={styles.courseHeader}>
                <Text style={styles.courseCode}>{item.course_code}</Text>
                <Badge label={`${item.enrolled_count}/${item.capacity}`} variant="primary" />
              </View>
              <Text style={styles.courseTitle}>{item.title}</Text>
              <View style={styles.stats}>
                <View style={styles.stat}>
                  <UsersIcon size={16} color={COLORS.gray[500]} />
                  <Text style={styles.statText}>{item.enrolled_count} Students</Text>
                </View>
                <View style={styles.stat}>
                  <BookOpenIcon size={16} color={COLORS.gray[500]} />
                  <Text style={styles.statText}>Active</Text>
                </View>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity style={styles.actionButton}>
                  <Text style={styles.actionText}>Students</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Text style={styles.actionText}>Schedule</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Text style={styles.actionText}>Grades</Text>
                </TouchableOpacity>
              </View>
            </Card>
          )}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    paddingBottom: SPACING.md
  },
  title: {
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary[100],
    justifyContent: 'center',
    alignItems: 'center'
  },
  list: {
    padding: SPACING.lg,
    paddingTop: 0
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
    marginBottom: SPACING.md
  },
  stats: {
    flexDirection: 'row',
    gap: SPACING.lg,
    marginBottom: SPACING.md
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs
  },
  statText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.sm
  },
  actionButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.gray[100],
    borderRadius: BORDER_RADIUS.sm
  },
  actionText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.primary[600],
    fontWeight: TYPOGRAPHY.weights.medium
  }
});
