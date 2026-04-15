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
import { format, isToday, isPast, isFuture, addHours } from 'date-fns';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, Badge, LoadingSpinner, EmptyState, Button } from '../../components/ui';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { VideoCameraIcon, CalendarIcon, ClockIcon, PlayIcon, LinkIcon } from '../../constants/icons';

interface Meeting {
  id: string;
  title: string;
  type: 'zoom' | 'google_meet';
  course_name?: string;
  start_time: string;
  duration: number;
  status: string;
  join_url: string;
}

export default function StudentMeetingsScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');

  const { data: meetingsData, isLoading, refetch } = useQuery({
    queryKey: ['meetings', 'student'],
    queryFn: async () => {
      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/meetings`);
      return res.json();
    }
  });

  const meetings: Meeting[] = meetingsData?.data || [];

  const filteredMeetings = meetings.filter((m: Meeting) => {
    const meetingTime = new Date(m.start_time).getTime();
    if (filter === 'upcoming') return isFuture(meetingTime);
    if (filter === 'past') return isPast(meetingTime);
    return true;
  });

  const upcomingCount = meetings.filter((m: Meeting) => isFuture(new Date(m.start_time).getTime())).length;

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const joinMeeting = (meeting: Meeting) => {
    Alert.alert('Join Meeting', `Opening: ${meeting.join_url}`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Open Link', onPress: () => {} }
    ]);
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
          <Text style={styles.title}>Live Classes</Text>
          <Text style={styles.subtitle}>Join Zoom and Google Meet sessions</Text>
          {upcomingCount > 0 && (
            <Badge label={`${upcomingCount} upcoming`} variant="success" />
          )}
        </View>

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
            message="No meetings found for this filter"
          />
        ) : (
          <View style={styles.meetingsList}>
            {filteredMeetings.map((meeting) => {
              const meetingTime = new Date(meeting.start_time);
              const isUpcoming = isFuture(meetingTime);
              const isStartingSoon = isFuture(meetingTime) && 
                meetingTime.getTime() - Date.now() < 15 * 60 * 1000;

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
                      <Text style={styles.metaText}>{format(meetingTime, 'h:mm a')} • {meeting.duration} min</Text>
                    </View>
                  </View>

                  {isStartingSoon && (
                    <Badge label="Starting Soon" variant="warning" />
                  )}

                  <Button
                    onPress={() => joinMeeting(meeting)}
                    style={[styles.joinButton, { 
                      backgroundColor: isUpcoming ? COLORS.primary[600] : COLORS.gray[600]
                    }]}
                  >
                    <PlayIcon size={16} color="white" />
                    <Text style={styles.joinButtonText}>
                      {isUpcoming ? 'Join Now' : 'View Recording'}
                    </Text>
                  </Button>
                </Card>
              );
            })}
          </View>
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
  header: {
    marginBottom: SPACING.lg
  },
  title: {
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.secondary,
    marginBottom: SPACING.sm
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
    color: COLORS.text.secondary,
    fontWeight: TYPOGRAPHY.weights.medium
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
    flexDirection: 'row',
    gap: SPACING.lg,
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
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.sm
  },
  joinButtonText: {
    color: 'white',
    fontWeight: TYPOGRAPHY.weights.semibold,
    fontSize: TYPOGRAPHY.sizes.sm
  }
});
