import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Card, Badge, LoadingSpinner, EmptyState } from '../../components/ui';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/theme';

export default function StudentVideosScreen() {
  const { data, isLoading } = useQuery({
    queryKey: ['videos'],
    queryFn: async () => {
      const r = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/videos`);
      return r.json();
    }
  });

  const videos = data?.data || [];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Lecture Videos</Text>
        <Text style={styles.subtitle}>Watch and review lectures with AI summaries</Text>

        {isLoading ? <LoadingSpinner /> : videos.length === 0 ? (
          <EmptyState title="No Videos" message="No lecture videos available yet" />
        ) : (
          <View style={styles.list}>
            {videos.map((v: any) => (
              <Card key={v.id} style={styles.videoCard}>
                <View style={styles.thumbnail}>
                  <Text style={styles.playIcon}>▶</Text>
                  {v.duration_seconds && (
                    <View style={styles.durationBadge}>
                      <Text style={styles.durationText}>{Math.floor(v.duration_seconds / 60)}:{(v.duration_seconds % 60).toString().padStart(2, '0')}</Text>
                    </View>
                  )}
                </View>
                <View style={styles.videoInfo}>
                  <Text style={styles.videoTitle} numberOfLines={2}>{v.title}</Text>
                  <Text style={styles.courseName}>{v.course?.course_code} - {v.course?.title}</Text>
                  {v.semester && <Text style={styles.semester}>{v.semester} {v.academic_year}</Text>}
                  <View style={styles.actions}>
                    <TouchableOpacity style={styles.playBtn} onPress={() => Linking.openURL(v.video_url)}>
                      <Text style={styles.playBtnText}>Play</Text>
                    </TouchableOpacity>
                    {v.ai_summary && (
                      <TouchableOpacity style={styles.summaryBtn}>
                        <Text style={styles.summaryBtnText}>AI Summary</Text>
                      </TouchableOpacity>
                    )}
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
  videoCard: { marginBottom: SPACING.md, overflow: 'hidden' },
  thumbnail: { height: 160, backgroundColor: COLORS.gray[800], alignItems: 'center', justifyContent: 'center', borderTopLeftRadius: BORDER_RADIUS.lg, borderTopRightRadius: BORDER_RADIUS.lg },
  playIcon: { fontSize: 40, color: 'white' },
  durationBadge: { position: 'absolute', bottom: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  durationText: { color: 'white', fontSize: TYPOGRAPHY.sizes.xs },
  videoInfo: { padding: SPACING.md },
  videoTitle: { fontSize: TYPOGRAPHY.sizes.base, fontWeight: TYPOGRAPHY.weights.semibold as any, color: COLORS.text.primary, marginBottom: SPACING.xs },
  courseName: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.text.secondary, marginBottom: 2 },
  semester: { fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.gray[400] },
  actions: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.md },
  playBtn: { flex: 1, backgroundColor: COLORS.primary[600], paddingVertical: SPACING.sm, borderRadius: BORDER_RADIUS.md, alignItems: 'center' },
  playBtnText: { color: 'white', fontWeight: TYPOGRAPHY.weights.medium as any, fontSize: TYPOGRAPHY.sizes.sm },
  summaryBtn: { flex: 1, backgroundColor: COLORS.primary[50], paddingVertical: SPACING.sm, borderRadius: BORDER_RADIUS.md, alignItems: 'center' },
  summaryBtnText: { color: COLORS.primary[700], fontWeight: TYPOGRAPHY.weights.medium as any, fontSize: TYPOGRAPHY.sizes.sm },
});
