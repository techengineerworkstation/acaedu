import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Modal,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { formatDuration } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, Badge, LoadingSpinner, EmptyState, Button } from '../../components/ui';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { PlayIcon, DocumentTextIcon, LightbulbIcon, ClipboardDocumentListIcon } from '../../constants/icons';

interface Lecture {
  id: string;
  title: string;
  course_name: string;
  lecture_type: 'lecture' | 'lab' | 'exam';
  duration_seconds: number;
  transcription: string;
  ai_summary?: string;
  ai_key_points?: string[];
  ai_flashcards?: { question: string; answer: string }[];
  resources: { name: string; url: string }[];
  view_count: number;
  created_at: string;
}

export default function StudentLecturesScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'lecture' | 'lab' | 'exam'>('all');
  const [selectedLecture, setSelectedLecture] = useState<Lecture | null>(null);
  const [activeTab, setActiveTab] = useState<'summary' | 'keyPoints' | 'flashcards'>('summary');
  const [showVideo, setShowVideo] = useState(false);

  const { data: lecturesData, isLoading, refetch } = useQuery({
    queryKey: ['lectures'],
    queryFn: async () => {
      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/lectures`);
      return res.json();
    }
  });

  const lectures: Lecture[] = lecturesData?.data || [];

  const filteredLectures = lectures.filter((l: Lecture) => {
    if (filter === 'all') return true;
    return l.lecture_type === filter;
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const formatDurationDisplay = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'lecture': return <Badge label="Lecture" variant="info" />;
      case 'lab': return <Badge label="Lab" variant="success" />;
      case 'exam': return <Badge label="Exam Review" variant="error" />;
      default: return <Badge label="Video" />;
    }
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
          <Text style={styles.title}>Recorded Lectures</Text>
          <Text style={styles.subtitle}>Watch recordings with AI-generated study materials</Text>
        </View>

        <View style={styles.filterTabs}>
          {(['all', 'lecture', 'lab', 'exam'] as const).map(f => (
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
        ) : filteredLectures.length === 0 ? (
          <EmptyState
            icon={<PlayIcon size={48} color={COLORS.gray[400]} />}
            title="No Lectures"
            message="Recorded lectures will appear here"
          />
        ) : (
          <View style={styles.lecturesList}>
            {filteredLectures.map((lecture) => (
              <TouchableOpacity 
                key={lecture.id} 
                onPress={() => { setSelectedLecture(lecture); setShowVideo(true); }}
              >
                <Card style={styles.lectureCard}>
                  <View style={styles.thumbnail}>
                    <PlayIcon size={40} color="white" />
                    <View style={styles.durationBadge}>
                      <Text style={styles.durationText}>
                        {formatDurationDisplay(lecture.duration_seconds)}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.lectureInfo}>
                    <View style={styles.lectureHeader}>
                      {getTypeBadge(lecture.lecture_type)}
                      {lecture.ai_summary && (
                        <Badge label="AI Summary" variant="success" />
                      )}
                    </View>
                    
                    <Text style={styles.lectureTitle} numberOfLines={2}>
                      {lecture.title}
                    </Text>
                    
                    <Text style={styles.courseName}>{lecture.course_name}</Text>
                    
                    <View style={styles.lectureMeta}>
                      <Text style={styles.metaText}>{lecture.view_count} views</Text>
                      <Text style={styles.metaText}>•</Text>
                      <Text style={styles.metaText}>{Math.round(lecture.duration_seconds / 60)} min</Text>
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      <Modal
        visible={showVideo}
        animationType="slide"
        onRequestClose={() => setShowVideo(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowVideo(false)} style={styles.closeButton}>
              <Text style={styles.closeText}>✕ Close</Text>
            </TouchableOpacity>
          </View>

          {selectedLecture && (
            <ScrollView>
              <View style={styles.videoPlayer}>
                <View style={styles.videoPlaceholder}>
                  <PlayIcon size={60} color={COLORS.gray[400]} />
                  <Text style={styles.videoPlaceholderText}>Video Player</Text>
                </View>
              </View>

              <View style={styles.lectureDetails}>
                <View style={styles.lectureHeader}>
                  {getTypeBadge(selectedLecture.lecture_type)}
                </View>
                
                <Text style={styles.lectureTitle}>{selectedLecture.title}</Text>
                <Text style={styles.courseName}>{selectedLecture.course_name}</Text>

                <View style={styles.studyTabs}>
                  {[
                    { key: 'summary', icon: DocumentTextIcon, label: 'Summary' },
                    { key: 'keyPoints', icon: LightbulbIcon, label: 'Key Points' },
                    { key: 'flashcards', icon: ClipboardDocumentListIcon, label: 'Flashcards' }
                  ].map(tab => (
                    <TouchableOpacity
                      key={tab.key}
                      onPress={() => setActiveTab(tab.key as any)}
                      style={[styles.studyTab, activeTab === tab.key && styles.studyTabActive]}
                    >
                      <Text style={[styles.studyTabText, activeTab === tab.key && styles.studyTabTextActive]}>
                        {tab.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.studyContent}>
                  {activeTab === 'summary' && (
                    <View>
                      <Text style={styles.studySectionTitle}>AI Summary</Text>
                      <Text style={styles.studyText}>
                        {selectedLecture.ai_summary || 'No AI summary available yet.'}
                      </Text>
                    </View>
                  )}

                  {activeTab === 'keyPoints' && (
                    <View>
                      <Text style={styles.studySectionTitle}>Key Points</Text>
                      {selectedLecture.ai_key_points?.length ? (
                        selectedLecture.ai_key_points.map((point, i) => (
                          <View key={i} style={styles.keyPoint}>
                            <Text style={styles.keyPointBullet}>•</Text>
                            <Text style={styles.keyPointText}>{point}</Text>
                          </View>
                        ))
                      ) : (
                        <Text style={styles.studyText}>No key points available yet.</Text>
                      )}
                    </View>
                  )}

                  {activeTab === 'flashcards' && (
                    <View>
                      <Text style={styles.studySectionTitle}>Flashcards</Text>
                      {selectedLecture.ai_flashcards?.length ? (
                        selectedLecture.ai_flashcards.map((card, i) => (
                          <Card key={i} style={styles.flashcard}>
                            <Text style={styles.flashcardQuestion}>{card.question}</Text>
                            <Text style={styles.flashcardAnswer}>{card.answer}</Text>
                          </Card>
                        ))
                      ) : (
                        <Text style={styles.studyText}>No flashcards available yet.</Text>
                      )}
                    </View>
                  )}
                </View>
              </View>
            </ScrollView>
          )}
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
    marginBottom: SPACING.lg
  },
  title: {
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary
  },
  filterTabs: {
    flexDirection: 'row',
    marginBottom: SPACING.lg,
    gap: SPACING.sm
  },
  filterTab: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.gray[100]
  },
  filterTabActive: {
    backgroundColor: COLORS.primary[600]
  },
  filterTabText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    fontWeight: TYPOGRAPHY.weights.medium
  },
  filterTabTextActive: {
    color: 'white'
  },
  lecturesList: {
    gap: SPACING.md
  },
  lectureCard: {
    flexDirection: 'row',
    padding: 0,
    overflow: 'hidden'
  },
  thumbnail: {
    width: 120,
    height: 100,
    backgroundColor: COLORS.gray[800],
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  durationBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  durationText: {
    color: 'white',
    fontSize: TYPOGRAPHY.sizes.xs
  },
  lectureInfo: {
    flex: 1,
    padding: SPACING.md
  },
  lectureHeader: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.xs
  },
  lectureTitle: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs
  },
  courseName: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs
  },
  lectureMeta: {
    flexDirection: 'row',
    gap: SPACING.sm
  },
  metaText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.secondary
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200]
  },
  closeButton: {
    padding: SPACING.sm
  },
  closeText: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.primary[600]
  },
  videoPlayer: {
    aspectRatio: 16 / 9,
    backgroundColor: COLORS.gray[900]
  },
  videoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  videoPlaceholderText: {
    color: COLORS.gray[400],
    marginTop: SPACING.sm
  },
  lectureDetails: {
    padding: SPACING.lg
  },
  studyTabs: {
    flexDirection: 'row',
    marginTop: SPACING.lg,
    backgroundColor: COLORS.gray[100],
    borderRadius: BORDER_RADIUS.md,
    padding: 4
  },
  studyTab: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.sm
  },
  studyTabActive: {
    backgroundColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2
  },
  studyTabText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary
  },
  studyTabTextActive: {
    color: COLORS.text.primary,
    fontWeight: TYPOGRAPHY.weights.medium
  },
  studyContent: {
    marginTop: SPACING.lg
  },
  studySectionTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
    marginBottom: SPACING.md
  },
  studyText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    lineHeight: 22
  },
  keyPoint: {
    flexDirection: 'row',
    marginBottom: SPACING.sm
  },
  keyPointBullet: {
    color: COLORS.primary[600],
    fontWeight: TYPOGRAPHY.weights.bold,
    marginRight: SPACING.sm,
    fontSize: TYPOGRAPHY.sizes.base
  },
  keyPointText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    lineHeight: 22
  },
  flashcard: {
    marginBottom: SPACING.sm
  },
  flashcardQuestion: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs
  },
  flashcardAnswer: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary
  }
});
