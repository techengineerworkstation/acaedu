import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Card, Badge, LoadingSpinner, EmptyState } from '../../components/ui';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/theme';

export default function LecturerVideosScreen() {
  const { data, isLoading } = useQuery({
    queryKey: ['videos', 'lecturer'],
    queryFn: async () => { const r = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/videos`); return r.json(); }
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Lecture Videos</Text>
        <Text style={styles.subtitle}>Manage your uploaded lecture recordings</Text>

        {isLoading ? <LoadingSpinner /> : (data?.data || []).length === 0 ? (
          <EmptyState title="No Videos" message="Upload your first lecture video" />
        ) : (
          <View style={styles.list}>
            {(data?.data || []).map((v: any) => (
              <Card key={v.id} style={styles.videoCard}>
                <View style={styles.videoRow}>
                  <View style={styles.thumbnailPlaceholder}><Text style={styles.playIcon}>▶</Text></View>
                  <View style={styles.videoInfo}>
                    <Text style={styles.videoTitle} numberOfLines={2}>{v.title}</Text>
                    <Text style={styles.courseName}>{v.course?.course_code}</Text>
                    <Text style={styles.meta}>{v.view_count} views | {v.semester}</Text>
                    <TouchableOpacity onPress={() => Linking.openURL(v.video_url)}>
                      <Text style={styles.openLink}>Open Video</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Card>
            ))}
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
  videoCard: { marginBottom: SPACING.sm },
  videoRow: { flexDirection: 'row' },
  thumbnailPlaceholder: { width: 100, height: 70, backgroundColor: COLORS.gray[800], borderRadius: BORDER_RADIUS.md, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md },
  playIcon: { fontSize: 24, color: 'white' },
  videoInfo: { flex: 1 },
  videoTitle: { fontSize: TYPOGRAPHY.sizes.base, fontWeight: TYPOGRAPHY.weights.semibold as any, color: COLORS.text.primary, marginBottom: 2 },
  courseName: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.text.secondary },
  meta: { fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.gray[400], marginBottom: SPACING.xs },
  openLink: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.primary[600], fontWeight: TYPOGRAPHY.weights.medium as any },
});
