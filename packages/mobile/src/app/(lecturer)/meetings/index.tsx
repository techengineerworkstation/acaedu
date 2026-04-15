import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Modal,
  TextInput,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format, addHours } from 'date-fns';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, Badge, LoadingSpinner, EmptyState, Button } from '../../components/ui';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { VideoCameraIcon, CalendarIcon, ClockIcon, PlusIcon, TrashIcon, PlayIcon, LinkIcon } from '../../constants/icons';

interface Meeting {
  id: string;
  title: string;
  type: 'zoom' | 'google_meet';
  course_name?: string;
  start_time: string;
  duration: number;
  status: string;
  join_url: string;
  host_url: string;
}

interface Course {
  id: string;
  course_code: string;
  title: string;
}

export default function LecturerMeetingsScreen() {
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    title: '',
    type: 'zoom' as 'zoom' | 'google_meet',
    course_id: '',
    start_time: '',
    duration: 60,
    agenda: ''
  });

  const { data: meetingsData, isLoading, refetch } = useQuery({
    queryKey: ['meetings', 'lecturer'],
    queryFn: async () => {
      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/meetings`);
      return res.json();
    }
  });

  const { data: coursesData } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/courses`);
      return res.json();
    }
  });

  const meetings: Meeting[] = meetingsData?.data || [];
  const courses: Course[] = coursesData?.data || [];

  const filteredMeetings = meetings.filter((m: Meeting) => {
    const meetingTime = new Date(m.start_time).getTime();
    if (filter === 'upcoming') return meetingTime > Date.now();
    if (filter === 'past') return meetingTime < Date.now();
    return true;
  });

  const upcomingCount = meetings.filter((m: Meeting) => new Date(m.start_time).getTime() > Date.now()).length;

  const createMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/meetings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        Alert.alert('Success', 'Meeting scheduled successfully!');
        setShowCreate(false);
        setForm({ title: '', type: 'zoom', course_id: '', start_time: '', duration: 60, agenda: '' });
        queryClient.invalidateQueries({ queryKey: ['meetings'] });
      }
    }
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Live Classes</Text>
            <Text style={styles.subtitle}>Schedule Zoom and Google Meet sessions</Text>
          </View>
          {upcomingCount > 0 && (
            <Badge label={`${upcomingCount} upcoming`} variant="success" />
          )}
        </View>

        <Button onPress={() => setShowCreate(true)} style={styles.createButton}>
          <PlusIcon size={20} color="white" />
          <Text style={styles.createButtonText}>Schedule Meeting</Text>
        </Button>

        <View style={styles.filterTabs}>
          {(['all', 'upcoming', 'past'] as const).map(f => (
            <TouchableOpacity
              key={f}
              onPress={() => setFilter(f)}
              style={[styles.filterTab, filter === f && styles.filterTabActive]}
            >
              <Text style={[styles.filterTabText, filter === f && styles.filterTabTextActive]}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {isLoading ? (
          <LoadingSpinner />
        ) : filteredMeetings.length === 0 ? (
          <EmptyState
            icon={<VideoCameraIcon size={48} color={COLORS.gray[400]} />}
            title="No Meetings"
            message="Schedule a live class to connect with students"
          />
        ) : (
          <View style={styles.meetingsList}>
            {filteredMeetings.map((meeting) => {
              const meetingTime = new Date(meeting.start_time);
              const isUpcoming = meetingTime.getTime() > Date.now();
              const isStartingSoon = isUpcoming && meetingTime.getTime() - Date.now() < 15 * 60 * 1000;

              return (
                <Card key={meeting.id} style={styles.meetingCard}>
                  <View style={[styles.platformBadge, {
                    backgroundColor: meeting.type === 'zoom' ? COLORS.blue[100] : COLORS.green[100]
                  }]}>
                    <Text style={{
                      fontSize: 10,
                      color: meeting.type === 'zoom' ? COLORS.blue[600] : COLORS.green[600]
                    }}>
                      {meeting.type === 'zoom' ? 'ZOOM' : 'MEET'}
                    </Text>
                  </View>

                  <Text style={styles.meetingTitle}>{meeting.title}</Text>
                  {meeting.course_name && (
                    <Text style={styles.courseName}>{meeting.course_name}</Text>
                  )}

                  <View style={styles.meetingMeta}>
                    <View style={styles.metaItem}>
                      <CalendarIcon size={14} color={COLORS.gray[500]} />
                      <Text style={styles.metaText}>{format(meetingTime, 'MMM d, yyyy')}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <ClockIcon size={14} color={COLORS.gray[500]} />
                      <Text style={styles.metaText}>
                        {format(meetingTime, 'h:mm a')} - {format(addHours(meetingTime, meeting.duration / 60), 'h:mm a')}
                      </Text>
                    </View>
                  </View>

                  {isStartingSoon && (
                    <Badge label="Starting Soon" variant="warning" />
                  )}

                  <View style={styles.meetingActions}>
                    <Button
                      onPress={() => {}}
                      style={styles.startButton}
                    >
                      <PlayIcon size={16} color="white" />
                      <Text style={styles.startButtonText}>Start</Text>
                    </Button>
                    <TouchableOpacity
                      onPress={() => Alert.alert('Copied', 'Meeting link copied to clipboard')}
                      style={styles.actionButton}
                    >
                      <LinkIcon size={18} color={COLORS.primary[600]} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => Alert.alert('Delete', 'Are you sure you want to delete this meeting?')}
                      style={styles.actionButton}
                    >
                      <TrashIcon size={18} color={COLORS.error} />
                    </TouchableOpacity>
                  </View>
                </Card>
              );
            })}
          </View>
        )}
      </ScrollView>

      <Modal
        visible={showCreate}
        animationType="slide"
        onRequestClose={() => setShowCreate(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCreate(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Schedule Meeting</Text>
            <View style={{ width: 60 }} />
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              value={form.title}
              onChangeText={(text) => setForm({ ...form, title: text })}
              placeholder="Meeting title"
            />

            <Text style={styles.label}>Course</Text>
            <View style={styles.select}>
              <Text style={styles.selectText}>
                {courses.find(c => c.id === form.course_id)?.course_code || 'Select course'}
              </Text>
            </View>

            <Text style={styles.label}>Platform</Text>
            <View style={styles.platformButtons}>
              <TouchableOpacity
                style={[styles.platformButton, form.type === 'zoom' && styles.platformButtonActive]}
                onPress={() => setForm({ ...form, type: 'zoom' })}
              >
                <Text style={[styles.platformText, form.type === 'zoom' && styles.platformTextActive]}>
                  Zoom
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.platformButton, form.type === 'google_meet' && styles.platformButtonActive]}
                onPress={() => setForm({ ...form, type: 'google_meet' })}
              >
                <Text style={[styles.platformText, form.type === 'google_meet' && styles.platformTextActive]}>
                  Google Meet
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Duration</Text>
            <View style={styles.durationButtons}>
              {[30, 60, 90, 120].map(d => (
                <TouchableOpacity
                  key={d}
                  style={[styles.durationButton, form.duration === d && styles.durationButtonActive]}
                  onPress={() => setForm({ ...form, duration: d })}
                >
                  <Text style={[styles.durationText, form.duration === d && styles.durationTextActive]}>
                    {d} min
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Button
              onPress={() => createMutation.mutate(form)}
              isLoading={createMutation.isPending}
              disabled={!form.title}
              style={styles.submitButton}
            >
              Schedule Meeting
            </Button>
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
    padding: SPACING.lg
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg
  },
  title: {
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    marginTop: SPACING.xs
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.lg
  },
  createButtonText: {
    color: 'white',
    fontWeight: TYPOGRAPHY.weights.semibold
  },
  filterTabs: {
    flexDirection: 'row',
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.gray[100],
    borderRadius: BORDER_RADIUS.md,
    padding: 4
  },
  filterTab: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.sm
  },
  filterTabActive: {
    backgroundColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2
  },
  filterTabText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary
  },
  filterTabTextActive: {
    color: COLORS.text.primary
  },
  meetingsList: {
    gap: SPACING.md
  },
  meetingCard: {
    marginBottom: 0
  },
  platformBadge: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm
  },
  meetingTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
    paddingRight: 60
  },
  courseName: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    marginBottom: SPACING.sm
  },
  meetingMeta: {
    gap: SPACING.sm,
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
  meetingActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.sm
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.lg
  },
  startButtonText: {
    color: 'white',
    fontWeight: TYPOGRAPHY.weights.semibold,
    fontSize: TYPOGRAPHY.sizes.sm
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.gray[100],
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200]
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold
  },
  cancelText: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.primary[600]
  },
  modalContent: {
    padding: SPACING.lg
  },
  label: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
    marginTop: SPACING.md
  },
  input: {
    backgroundColor: COLORS.gray[100],
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: TYPOGRAPHY.sizes.base
  },
  select: {
    backgroundColor: COLORS.gray[100],
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md
  },
  selectText: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.secondary
  },
  platformButtons: {
    flexDirection: 'row',
    gap: SPACING.md
  },
  platformButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    backgroundColor: COLORS.gray[100],
    borderRadius: BORDER_RADIUS.md
  },
  platformButtonActive: {
    backgroundColor: COLORS.primary[600]
  },
  platformText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary
  },
  platformTextActive: {
    color: 'white'
  },
  durationButtons: {
    flexDirection: 'row',
    gap: SPACING.sm
  },
  durationButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    backgroundColor: COLORS.gray[100],
    borderRadius: BORDER_RADIUS.md
  },
  durationButtonActive: {
    backgroundColor: COLORS.primary[600]
  },
  durationText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary
  },
  durationTextActive: {
    color: 'white'
  },
  submitButton: {
    marginTop: SPACING.xl
  }
});
