import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '../../services/api';
import { LoadingSpinner, EmptyState } from '../../components/ui';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { BellIcon, ClockIcon } from '../../constants/icons';
import { formatDistanceToNow } from 'date-fns';

export default function StudentNotificationsScreen() {
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.getAll({ limit: 50 })
  });

  const markAsReadMutation = useMutation({
    mutationFn: (ids: string[]) => notificationsApi.markAsRead(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const onRefresh = async () => {
    setRefreshing(true);
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
    setRefreshing(false);
  };

  const handleNotificationPress = (id: string) => {
    markAsReadMutation.mutate([id]);
    // Navigate based on notification data
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

  const renderNotification = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        !item.is_read && styles.notificationUnread
      ]}
      onPress={() => handleNotificationPress(item.id)}
    >
      <View style={styles.notificationIcon}>
        <Text style={{ fontSize: 24 }}>{getNotificationIcon(item.type)}</Text>
      </View>
      <View style={styles.notificationContent}>
        <Text style={[
          styles.notificationTitle,
          !item.is_read && styles.notificationTitleUnread
        ]}>
          {item.title}
        </Text>
        <Text style={styles.notificationMessage} numberOfLines={2}>
          {item.message}
        </Text>
        <View style={styles.notificationMeta}>
          <ClockIcon size={12} color={COLORS.gray[400]} />
          <Text style={styles.notificationTime}>
            {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
          </Text>
          {!item.is_read && <View style={styles.unreadDot} />}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {isLoading ? (
          <LoadingSpinner fullScreen />
        ) : data?.data?.length > 0 ? (
          <FlatList
            data={data.data}
            keyExtractor={(item) => item.id}
            renderItem={renderNotification}
            contentContainerStyle={styles.list}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        ) : (
          <EmptyState
            icon={<BellIcon size={64} color={COLORS.gray[400]} />}
            title="No Notifications"
            message="You're all caught up!"
          />
        )}
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
  list: {
    padding: SPACING.md
  },
  notificationItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  notificationUnread: {
    backgroundColor: COLORS.primary[50],
    borderColor: COLORS.primary[200]
  },
  notificationIcon: {
    marginRight: SPACING.md
  },
  notificationContent: {
    flex: 1
  },
  notificationTitle: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs
  },
  notificationTitleUnread: {
    fontWeight: TYPOGRAPHY.weights.bold
  },
  notificationMessage: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
    lineHeight: TYPOGRAPHY.lineHeights.normal
  },
  notificationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs
  },
  notificationTime: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.gray[500]
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary[600],
    marginLeft: 'auto'
  }
});
