import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Card,
  Badge,
  Button,
  Input,
  Select,
  LoadingSpinner,
  EmptyState
} from '../../components/ui';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/theme';
import {
  BellIcon,
  PlusIcon,
  SendIcon,
  UsersIcon,
  MegaphoneIcon,
  ClockIcon
} from '../../constants/icons';
import { notificationsApi } from '../../services/api';
import { formatDistanceToNow } from 'date-fns';

type NotificationType = 'announcement' | 'schedule_reminder' | 'grade_posted' | 'assignment_due' | 'exam_reminder' | 'general';

const NOTIFICATION_TYPES: { value: NotificationType; label: string }[] = [
  { value: 'announcement', label: 'Announcement' },
  { value: 'schedule_reminder', label: 'Schedule Reminder' },
  { value: 'grade_posted', label: 'Grade Posted' },
  { value: 'assignment_due', label: 'Assignment Due' },
  { value: 'exam_reminder', label: 'Exam Reminder' },
  { value: 'general', label: 'General' }
];

const ROLE_OPTIONS = [
  { label: 'All Users', value: 'all' },
  { label: 'Students Only', value: 'student' },
  { label: 'Lecturers Only', value: 'lecturer' },
  { label: 'Admin Only', value: 'admin' }
];

export default function AdminNotificationsScreen() {
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [broadcastType, setBroadcastType] = useState<NotificationType>('announcement');
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [targetRole, setTargetRole] = useState('all');
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  // Fetch recent notifications (sent by this admin or system-wide)
  const { data, isLoading } = useQuery({
    queryKey: ['notifications', 'admin'],
    queryFn: async () => {
      // For admin, we might want to see recent system notifications
      const res = await notificationsApi.getAll({ limit: 50 });
      return res.data?.slice(0, 20) || [];
    }
  });

  const broadcastMutation = useMutation({
    mutationFn: async (payload: {
      type: string;
      title: string;
      message: string;
      target_role?: string;
    }) => {
      setIsBroadcasting(true);
      const target = targetRole === 'all' ? undefined : targetRole;
      return notificationsApi.broadcast({
        ...payload,
        target_role: target
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      setModalVisible(false);
      resetForm();
      Alert.alert('Success', 'Notification broadcast successfully');
    },
    onError: (error: any) => {
      Alert.alert('Error', error.message || 'Failed to broadcast notification');
    },
    onSettled: () => {
      setIsBroadcasting(false);
    }
  });

  const onRefresh = async () => {
    setRefreshing(true);
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
    setRefreshing(false);
  };

  const handleBroadcast = () => {
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) {
      Alert.alert('Error', 'Please fill in both title and message');
      return;
    }

    broadcastMutation.mutate({
      type: broadcastType,
      title: broadcastTitle.trim(),
      message: broadcastMessage.trim(),
      target_role: targetRole === 'all' ? undefined : targetRole
    });
  };

  const resetForm = () => {
    setBroadcastTitle('');
    setBroadcastMessage('');
    setBroadcastType('announcement');
    setTargetRole('all');
  };

  const openBroadcastModal = () => {
    resetForm();
    setModalVisible(true);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'announcement':
        return '📢';
      case 'schedule_reminder':
        return '⏰';
      case 'grade_posted':
        return '📊';
      case 'assignment_due':
        return '📝';
      case 'exam_reminder':
        return '📋';
      default:
        return '🔔';
    }
  };

  const getNotificationBadgeVariant = (type: string) => {
    switch (type) {
      case 'announcement':
        return 'primary';
      case 'schedule_reminder':
        return 'info';
      case 'grade_posted':
        return 'success';
      case 'assignment_due':
      case 'exam_reminder':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header Action */}
        <View style={styles.headerRow}>
          <Text style={styles.title}>Announcements</Text>
          <Button
            title="Broadcast"
            onPress={openBroadcastModal}
            variant="primary"
            size="sm"
            leftIcon={<SendIcon size={16} color="white" />}
          />
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <Card style={styles.statCard} padding="sm">
            <MegaphoneIcon size={20} color={COLORS.primary[600]} />
            <Text style={styles.statValue}>{data?.length || 0}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </Card>
          <Card style={styles.statCard} padding="sm">
            <UsersIcon size={20} color={COLORS.secondary[500]} />
            <Text style={styles.statValue}>All</Text>
            <Text style={styles.statLabel}>Target</Text>
          </Card>
        </View>

        {isLoading ? (
          <LoadingSpinner fullScreen />
        ) : data?.length > 0 ? (
          <FlatList
            data={data}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <Card style={styles.notificationCard} padding="md">
                <View style={styles.cardHeader}>
                  <View style={styles.iconBadgeRow}>
                    <Text style={styles.iconEmoji}>{getNotificationIcon(item.type)}</Text>
                    <Badge
                      label={NOTIFICATION_TYPES.find(t => t.value === item.type)?.label || item.type}
                      variant={getNotificationBadgeVariant(item.type) as any}
                      size="sm"
                    />
                  </View>
                  <View style={styles.timeRow}>
                    <ClockIcon size={12} color={COLORS.gray[400]} />
                    <Text style={styles.timeText}>
                      {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                    </Text>
                  </View>
                </View>

                <Text style={styles.titleText} numberOfLines={2}>
                  {item.title}
                </Text>
                <Text style={styles.messageText} numberOfLines={3}>
                  {item.message}
                </Text>

                {item.is_read && (
                  <View style={styles.readBadge}>
                    <Text style={styles.readText}>Read</Text>
                  </View>
                )}
              </Card>
            )}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        ) : (
          <EmptyState
            icon={<BellIcon size={64} color={COLORS.gray[400]} />}
            title="No Notifications"
            message="Send your first announcement to get started"
            action={
              <Button title="Broadcast Now" onPress={openBroadcastModal} variant="primary" />
            }
          />
        )}

        {/* Broadcast Modal */}
        <Modal
          visible={modalVisible}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setModalVisible(false)}
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Button title="Cancel" onPress={() => setModalVisible(false)} variant="ghost" />
              <Text style={styles.modalTitle}>Broadcast Announcement</Text>
              <Button
                title="Send"
                onPress={handleBroadcast}
                variant="primary"
                isLoading={isBroadcasting}
              />
            </View>

            <ScrollView contentContainerStyle={styles.modalContent}>
              <Select
                label="Notification Type"
                options={NOTIFICATION_TYPES}
                value={broadcastType}
                onChange={(value) => setBroadcastType(value as NotificationType)}
              />

              <Input
                label="Title"
                placeholder="Enter announcement title..."
                value={broadcastTitle}
                onChangeText={setBroadcastTitle}
                multiline
                numberOfLines={2}
              />

              <Input
                label="Message"
                placeholder="Enter your message..."
                value={broadcastMessage}
                onChangeText={setBroadcastMessage}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
              />

              <Select
                label="Target Audience"
                options={ROLE_OPTIONS}
                value={targetRole}
                onChange={setTargetRole}
                placeholder="Select target role"
              />

              <View style={styles.infoBox}>
                <Text style={styles.infoIcon}>ℹ️</Text>
                <Text style={styles.infoText}>
                  This will send a notification to all selected users. They will receive
                  an in-app notification and email (if enabled).
                </Text>
              </View>
            </ScrollView>
          </SafeAreaView>
        </Modal>
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
  headerRow: {
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
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.xs
  },
  statValue: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary
  },
  statLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.secondary
  },
  list: {
    padding: SPACING.md
  },
  notificationCard: {
    marginBottom: SPACING.md
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm
  },
  iconBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm
  },
  iconEmoji: {
    fontSize: 24
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs
  },
  timeText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.gray[500]
  },
  titleText: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs
  },
  messageText: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.secondary,
    lineHeight: TYPOGRAPHY.lineHeights.normal
  },
  readBadge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: COLORS.gray[100],
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm
  },
  readText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.gray[500],
    textTransform: 'uppercase'
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
  infoBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary[50],
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.sm,
    marginTop: SPACING.sm
  },
  infoIcon: {
    fontSize: 20
  },
  infoText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    lineHeight: TYPOGRAPHY.lineHeights.normal
  }
});
