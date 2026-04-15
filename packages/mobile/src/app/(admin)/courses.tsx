import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Badge, Button, Input, Select, LoadingSpinner, EmptyState } from '../../components/ui';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { BookOpenIcon, PlusIcon, EditIcon, TrashIcon, UsersIcon, SearchIcon } from '../../constants/icons';

export default function AdminCoursesScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({
    course_code: '',
    title: '',
    description: '',
    credits: '3',
    department: '',
    capacity: '30'
  });

  const departments = [
    { label: 'Computer Science', value: 'cs' },
    { label: 'Mathematics', value: 'math' },
    { label: 'Physics', value: 'phys' },
    { label: 'Engineering', value: 'engr' },
    { label: 'Business', value: 'bus' }
  ];

  // Mock courses data
  const courses = [
    { id: '1', course_code: 'CS101', title: 'Introduction to Computer Science', credits: 3, department: 'cs', enrolled_count: 35, capacity: 40, lecturer: 'Dr. Johnson' },
    { id: '2', course_code: 'MATH201', title: 'Calculus II', credits: 4, department: 'math', enrolled_count: 28, capacity: 35, lecturer: 'Prof. Chen' },
    { id: '3', course_code: 'PHYS101', title: 'General Physics', credits: 4, department: 'phys', enrolled_count: 32, capacity: 40, lecturer: 'Dr. Rodriguez' },
    { id: '4', course_code: 'ENG301', title: 'Engineering Mechanics', credits: 3, department: 'engr', enrolled_count: 24, capacity: 30, lecturer: 'Prof. Williams' },
    { id: '5', course_code: 'BUS101', title: 'Introduction to Business', credits: 3, department: 'bus', enrolled_count: 45, capacity: 50, lecturer: 'Dr. Davis' }
  ];

  const filteredCourses = courses.filter(c =>
    c.course_code.toLowerCase().includes(search.toLowerCase()) ||
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = () => {
    // Would call API
    console.log('Create course:', formData);
    setModalVisible(false);
    setFormData({
      course_code: '',
      title: '',
      description: '',
      credits: '3',
      department: '',
      capacity: '30'
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Courses Management</Text>
          <Button
            title="Add Course"
            onPress={() => setModalVisible(true)}
            variant="primary"
            size="sm"
            leftIcon={<PlusIcon size={16} color="white" />}
          />
        </View>

        {/* Search */}
        <Card style={styles.filterCard} padding="md">
          <View style={styles.searchRow}>
            <SearchIcon size={16} color={COLORS.gray[500]} />
            <Input
              placeholder="Search courses..."
              value={search}
              onChangeText={setSearch}
              style={styles.searchInput}
              containerStyle={{ flex: 1, marginBottom: 0 }}
            />
          </View>
        </Card>

        {/* Courses List */}
        <FlatList
          data={filteredCourses}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Card style={styles.courseCard} padding="md">
              <View style={styles.cardHeader}>
                <View style={styles.courseInfo}>
                  <Text style={styles.courseCode}>{item.course_code}</Text>
                  <Text style={styles.courseTitle} numberOfLines={1}>{item.title}</Text>
                </View>
                <Badge label={`${item.credits} cr`} variant="primary" />
              </View>

              <View style={styles.courseMeta}>
                <View style={styles.metaItem}>
                  <UsersIcon size={14} color={COLORS.gray[500]} />
                  <Text style={styles.metaText}>
                    {item.enrolled_count}/{item.capacity}
                  </Text>
                </View>
                <Text style={styles.metaText}>
                  {departments.find(d => d.value === item.department)?.label}
                </Text>
                <Text style={styles.metaText}>
                  {item.lecturer}
                </Text>
              </View>

              <View style={styles.actions}>
                <TouchableOpacity style={styles.actionButton}>
                  <EditIcon size={14} color={COLORS.primary[600]} />
                  <Text style={styles.actionText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Text style={styles.actionText}>Students</Text>
                </TouchableOpacity>
              </View>
            </Card>
          )}
        />
      </View>

      {/* Create Course Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Button title="Cancel" onPress={() => setModalVisible(false)} variant="ghost" />
            <Text style={styles.modalTitle}>Add New Course</Text>
            <Button title="Create" onPress={handleCreate} variant="primary" />
          </View>

          <ScrollView contentContainerStyle={styles.modalContent}>
            <Input
              label="Course Code"
              placeholder="e.g., CS101"
              value={formData.course_code}
              onChangeText={(course_code) => setFormData({ ...formData, course_code })}
            />

            <Input
              label="Course Title"
              placeholder="Enter course title"
              value={formData.title}
              onChangeText={(title) => setFormData({ ...formData, title })}
            />

            <Input
              label="Description"
              placeholder="Course description..."
              value={formData.description}
              onChangeText={(description) => setFormData({ ...formData, description })}
              multiline
              numberOfLines={3}
            />

            <View style={styles.row}>
              <View style={[styles.inputContainer, { flex: 1, marginRight: SPACING.sm }]}>
                <Text style={styles.inputLabel}>Credits</Text>
                <Input
                  placeholder="3"
                  value={formData.credits}
                  onChangeText={(credits) => setFormData({ ...formData, credits })}
                  keyboardType="numeric"
                />
              </View>
              <View style={[styles.inputContainer, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Capacity</Text>
                <Input
                  placeholder="30"
                  value={formData.capacity}
                  onChangeText={(capacity) => setFormData({ ...formData, capacity })}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <Select
              label="Department"
              options={departments}
              value={formData.department}
              onChange={(department) => setFormData({ ...formData, department })}
              placeholder="Select department"
            />
          </ScrollView>
        </SafeAreaView>
      </Modal>
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
    paddingBottom: SPACING.sm
  },
  title: {
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary
  },
  filterCard: {
    margin: SPACING.lg,
    marginBottom: SPACING.md
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm
  },
  searchInput: {
    flex: 1
  },
  list: {
    padding: SPACING.lg,
    paddingTop: 0
  },
  courseCard: {
    marginBottom: SPACING.md
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm
  },
  courseInfo: {
    flex: 1,
    marginRight: SPACING.sm
  },
  courseCode: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary[600]
  },
  courseTitle: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.primary,
    marginTop: 2
  },
  courseMeta: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs
  },
  metaText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs
  },
  actionText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.primary[600],
    fontWeight: TYPOGRAPHY.weights.medium
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary
  },
  modalContent: {
    padding: SPACING.lg
  },
  row: {
    flexDirection: 'row',
    marginBottom: SPACING.md
  },
  inputContainer: {
    flex: 1
  },
  inputLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs
  }
});
