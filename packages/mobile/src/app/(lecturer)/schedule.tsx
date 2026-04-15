import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, Badge, Button, Input, Select, LoadingSpinner, EmptyState } from '../../components/ui';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SCHEDULE_TYPE_COLORS, SCHEDULE_TYPE_LABELS } from '../../constants/theme';
import { CalendarIcon, ClockIcon, MapPinIcon, PlusIcon, EditIcon, TrashIcon } from '../../constants/icons';
import { format, parseISO } from 'date-fns';

export default function LecturerScheduleScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    schedule_type: 'lecture',
    start_time: '',
    end_time: '',
    location: '',
    is_recurring: false
  });

  const queryClient = useQueryClient();

  const { data: schedulesData, isLoading } = useQuery({
    queryKey: ['schedules', 'my'],
    queryFn: async () => {
      // Mock data for demo
      return {
        data: [
          {
            id: '1',
            title: 'CS101 Lecture',
            schedule_type: 'lecture',
            start_time: '2024-03-30T09:00:00',
            end_time: '2024-03-30T10:30:00',
            location: 'Room 301',
            course: { course_code: 'CS101', title: 'Introduction to CS' }
          },
          {
            id: '2',
            title: 'CS201 Lab',
            schedule_type: 'lab',
            start_time: '2024-03-31T14:00:00',
            end_time: '2024-03-31T16:00:00',
            location: 'Lab 2',
            course: { course_code: 'CS201', title: 'Data Structures' }
          }
        ]
      };
    }
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => schedulesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      setModalVisible(false);
      resetForm();
    }
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      schedule_type: 'lecture',
      start_time: '',
      end_time: '',
      location: '',
      is_recurring: false
    });
    setEditingSchedule(null);
  };

  const handleSave = () => {
    createMutation.mutate(formData);
  };

  const scheduleTypes = Object.entries(SCHEDULE_TYPE_LABELS).map(([value, label]) => ({
    value,
    label
  }));

  const renderSchedule = ({ item }: { item: any }) => {
    const start = parseISO(item.start_time);
    const end = parseISO(item.end_time);
    const bgColor = SCHEDULE_BG_COLORS[item.schedule_type] || COLORS.gray[100];

    return (
      <Card style={[styles.scheduleCard, { backgroundColor: bgColor }]} padding="md">
        <View style={styles.cardHeader}>
          <View style={[styles.timeBadge, { backgroundColor: COLORS.gray[700] + '20' }]}>
            <Text style={[styles.timeText, { color: COLORS.gray[700] }]}>
              {format(start, 'MMM d')} • {format(start, 'h:mm a')} - {format(end, 'h:mm a')}
            </Text>
          </View>
          <Badge label={SCHEDULE_TYPE_LABELS[item.schedule_type]} variant="primary" />
        </View>

        <Text style={[styles.cardTitle, { color: COLORS.text.primary }]}>
          {item.title}
        </Text>
        <Text style={[styles.courseCode, { color: COLORS.text.secondary }]}>
          {item.course?.course_code}
        </Text>

        {item.location && (
          <View style={styles.locationRow}>
            <MapPinIcon size={16} color={COLORS.gray[500]} />
            <Text style={styles.locationText}>{item.location}</Text>
          </View>
        )}

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              setEditingSchedule(item);
              setFormData({
                title: item.title,
                description: item.description || '',
                schedule_type: item.schedule_type,
                start_time: item.start_time,
                end_time: item.end_time,
                location: item.location || '',
                is_recurring: item.is_recurring || false
              });
              setModalVisible(true);
            }}
          >
            <EditIcon size={16} color={COLORS.primary[600]} />
            <Text style={styles.actionText}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, styles.deleteButton]}>
            <TrashIcon size={16} color={COLORS.error} />
            <Text style={[styles.actionText, { color: COLORS.error }]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Schedule</Text>
          <Button
            title="Add"
            onPress={() => setModalVisible(true)}
            variant="primary"
            size="sm"
            leftIcon={<PlusIcon size={16} color="white" />}
          />
        </View>

        <FlatList
          data={schedulesData?.data || []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={renderSchedule}
          ListEmptyComponent={
            <EmptyState
              icon={<CalendarIcon size={64} color={COLORS.gray[400]} />}
              title="No Scheduled Classes"
              message="Tap + to create a schedule"
              actionLabel="Create Schedule"
              onAction={() => setModalVisible(true)}
            />
          }
        />
      </View>

      {/* Create/Edit Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Button
              title="Cancel"
              onPress={() => {
                setModalVisible(false);
                resetForm();
              }}
              variant="ghost"
            />
            <Text style={styles.modalTitle}>
              {editingSchedule ? 'Edit Schedule' : 'New Schedule'}
            </Text>
            <Button
              title="Save"
              onPress={handleSave}
              variant="primary"
              isLoading={createMutation.isPending}
            />
          </View>

          <ScrollView contentContainerStyle={styles.modalContent}>
            <Input
              label="Title"
              placeholder="e.g., Introduction Lecture"
              value={formData.title}
              onChangeText={(title) => setFormData({ ...formData, title })}
            />

            <Select
              label="Type"
              options={scheduleTypes}
              value={formData.schedule_type}
              onChange={(schedule_type) => setFormData({ ...formData, schedule_type })}
            />

            <View style={styles.dateTimeRow}>
              <View style={[styles.inputContainer, { flex: 1, marginRight: SPACING.sm }]}>
                <Text style={styles.inputLabel}>Start</Text>
                <Input
                  placeholder="YYYY-MM-DD HH:mm"
                  value={formData.start_time}
                  onChangeText={(start_time) => setFormData({ ...formData, start_time })}
                />
              </View>
              <View style={[styles.inputContainer, { flex: 1 }]}>
                <Text style={styles.inputLabel}>End</Text>
                <Input
                  placeholder="YYYY-MM-DD HH:mm"
                  value={formData.end_time}
                  onChangeText={(end_time) => setFormData({ ...formData, end_time })}
                />
              </View>
            </View>

            <Input
              label="Location"
              placeholder="e.g., Room 301"
              value={formData.location}
              onChangeText={(location) => setFormData({ ...formData, location })}
            />

            <Input
              label="Description"
              placeholder="Optional details..."
              value={formData.description}
              onChangeText={(description) => setFormData({ ...formData, description })}
              multiline
              numberOfLines={3}
            />

            <View style={styles.checkboxRow}>
              <TouchableOpacity
                style={[styles.checkbox, formData.is_recurring && styles.checkboxChecked]}
                onPress={() => setFormData({ ...formData, is_recurring: !formData.is_recurring })}
              >
                {formData.is_recurring && <Text style={styles.checkIcon}>✓</Text>}
              </TouchableOpacity>
              <Text style={styles.checkboxLabel}>Recurring event</Text>
            </View>
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
    alignItems: 'flex-start',
    marginBottom: SPACING.sm
  },
  timeBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    flex: 1,
    marginRight: SPACING.sm
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
    color: COLORS.text.secondary,
    marginBottom: SPACING.sm
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.xs
  },
  locationText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
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
  deleteButton: {},
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
  dateTimeRow: {
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
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.md
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary[600],
    borderColor: COLORS.primary[600]
  },
  checkIcon: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold'
  },
  checkboxLabel: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.primary
  }
});
