import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { format, differenceInDays } from 'date-fns';
import { Card, Badge, LoadingSpinner, EmptyState } from '../../components/ui';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { CalendarIcon } from '../../constants/icons';

const categoryColors: Record<string, string> = {
  academic: COLORS.primary[500], social: COLORS.secondary[500],
  sports: '#F59E0B', career: '#8B5CF6', other: COLORS.gray[500]
};

export default function StudentEventsScreen() {
  const [refreshing, setRefreshing] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['events', 'upcoming'],
    queryFn: async () => {
      const r = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/events?upcoming=true`);
      return r.json();
    }
  });

  const events = data?.data || [];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await refetch(); setRefreshing(false); }} />}>
        <Text style={styles.title}>Upcoming Events</Text>
        <Text style={styles.subtitle}>Campus events, seminars & workshops</Text>

        {isLoading ? <LoadingSpinner /> : events.length === 0 ? (
          <EmptyState icon={<CalendarIcon size={48} color={COLORS.gray[400]} />} title="No Events" message="No upcoming events" />
        ) : (
          <View style={styles.list}>
            {events.map((event: any) => {
              const daysUntil = differenceInDays(new Date(event.start_date), new Date());
              const color = categoryColors[event.category] || COLORS.gray[500];
              return (
                <Card key={event.id} style={styles.eventCard}>
                  <View style={styles.eventRow}>
                    <View style={[styles.dateBox, { backgroundColor: color + '15' }]}>
                      <Text style={[styles.dateMonth, { color }]}>{format(new Date(event.start_date), 'MMM')}</Text>
                      <Text style={[styles.dateDay, { color }]}>{format(new Date(event.start_date), 'd')}</Text>
                    </View>
                    <View style={styles.eventInfo}>
                      <View style={styles.badges}>
                        <Badge label={event.category} />
                        {daysUntil <= 7 && <Badge label={daysUntil === 0 ? 'Today' : `${daysUntil}d`} variant="warning" />}
                      </View>
                      <Text style={styles.eventTitle}>{event.title}</Text>
                      {event.description && <Text style={styles.eventDesc} numberOfLines={2}>{event.description}</Text>}
                      <Text style={styles.eventMeta}>
                        {format(new Date(event.start_date), 'h:mm a')}
                        {event.location ? ` | ${event.location}` : ''}
                      </Text>
                    </View>
                  </View>
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
  container: { flex: 1, backgroundColor: COLORS.gray[50] },
  content: { padding: SPACING.lg },
  title: { fontSize: TYPOGRAPHY.sizes['2xl'], fontWeight: TYPOGRAPHY.weights.bold as any, color: COLORS.text.primary },
  subtitle: { fontSize: TYPOGRAPHY.sizes.base, color: COLORS.text.secondary, marginTop: SPACING.xs, marginBottom: SPACING.lg },
  list: { gap: SPACING.md },
  eventCard: { marginBottom: SPACING.sm },
  eventRow: { flexDirection: 'row' },
  dateBox: { width: 60, height: 60, borderRadius: BORDER_RADIUS.md, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md },
  dateMonth: { fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weights.medium as any },
  dateDay: { fontSize: TYPOGRAPHY.sizes['2xl'], fontWeight: TYPOGRAPHY.weights.bold as any },
  eventInfo: { flex: 1 },
  badges: { flexDirection: 'row', gap: SPACING.xs, marginBottom: SPACING.xs },
  eventTitle: { fontSize: TYPOGRAPHY.sizes.base, fontWeight: TYPOGRAPHY.weights.semibold as any, color: COLORS.text.primary, marginBottom: 2 },
  eventDesc: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.text.secondary, marginBottom: SPACING.xs },
  eventMeta: { fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.gray[400] },
});
