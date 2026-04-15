import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Card, Badge, LoadingSpinner } from '../../components/ui';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/theme';

export default function LecturerAttendanceScreen() {
  const [selectedCourse, setSelectedCourse] = useState('');

  const { data: courses } = useQuery({
    queryKey: ['courses', 'lecturer'],
    queryFn: async () => { const r = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/courses`); return r.json(); }
  });

  const { data: students, isLoading } = useQuery({
    queryKey: ['students', selectedCourse],
    queryFn: async () => { const r = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/users?course_id=${selectedCourse}`); return r.json(); },
    enabled: !!selectedCourse
  });

  const [attendanceMap, setAttendanceMap] = useState<Record<string, string>>({});

  const submitAttendance = async () => {
    const records = Object.entries(attendanceMap).map(([studentId, status]) => ({
      student_id: studentId, course_id: selectedCourse, status
    }));
    try {
      await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/attendance`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ records })
      });
      Alert.alert('Success', `Attendance recorded for ${records.length} students`);
    } catch { Alert.alert('Error', 'Failed to record attendance'); }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Attendance</Text>

        <View style={styles.coursePicker}>
          {(courses?.data || []).map((c: any) => (
            <TouchableOpacity key={c.id} style={[styles.courseChip, selectedCourse === c.id && styles.courseChipActive]} onPress={() => setSelectedCourse(c.id)}>
              <Text style={[styles.courseChipText, selectedCourse === c.id && styles.courseChipTextActive]}>{c.course_code}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {selectedCourse && (
          <>
            {isLoading ? <LoadingSpinner /> : (
              <View style={styles.studentList}>
                {(students?.data || []).map((s: any) => (
                  <Card key={s.id} style={styles.studentCard}>
                    <View style={styles.studentInfo}>
                      <View style={styles.avatar}><Text style={styles.avatarText}>{s.full_name?.charAt(0)}</Text></View>
                      <View><Text style={styles.studentName}>{s.full_name}</Text><Text style={styles.studentMatric}>{s.matriculation_number || s.email}</Text></View>
                    </View>
                    <View style={styles.statusRow}>
                      {['present', 'absent', 'late'].map(status => (
                        <TouchableOpacity key={status} style={[styles.statusBtn,
                          attendanceMap[s.id] === status && (status === 'present' ? styles.presentActive : status === 'absent' ? styles.absentActive : styles.lateActive)
                        ]} onPress={() => setAttendanceMap({ ...attendanceMap, [s.id]: status })}>
                          <Text style={[styles.statusText, attendanceMap[s.id] === status && styles.statusTextActive]}>{status.charAt(0).toUpperCase()}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </Card>
                ))}
              </View>
            )}

            {Object.keys(attendanceMap).length > 0 && (
              <TouchableOpacity style={styles.submitBtn} onPress={submitAttendance}>
                <Text style={styles.submitBtnText}>Save Attendance ({Object.keys(attendanceMap).length})</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.gray[50] },
  content: { padding: SPACING.lg },
  title: { fontSize: TYPOGRAPHY.sizes['2xl'], fontWeight: TYPOGRAPHY.weights.bold as any, color: COLORS.text.primary, marginBottom: SPACING.md },
  coursePicker: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.lg },
  courseChip: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: BORDER_RADIUS.full, backgroundColor: COLORS.gray[200] },
  courseChipActive: { backgroundColor: COLORS.primary[600] },
  courseChipText: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.text.secondary, fontWeight: TYPOGRAPHY.weights.medium as any },
  courseChipTextActive: { color: 'white' },
  studentList: { gap: SPACING.sm },
  studentCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  studentInfo: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.primary[100], alignItems: 'center', justifyContent: 'center', marginRight: SPACING.sm },
  avatarText: { color: COLORS.primary[700], fontWeight: TYPOGRAPHY.weights.semibold as any },
  studentName: { fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.medium as any, color: COLORS.text.primary },
  studentMatric: { fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.text.secondary },
  statusRow: { flexDirection: 'row', gap: SPACING.xs },
  statusBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.gray[200], alignItems: 'center', justifyContent: 'center' },
  presentActive: { backgroundColor: '#10B981' },
  absentActive: { backgroundColor: '#EF4444' },
  lateActive: { backgroundColor: '#F59E0B' },
  statusText: { fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.bold as any, color: COLORS.text.secondary },
  statusTextActive: { color: 'white' },
  submitBtn: { backgroundColor: COLORS.primary[600], paddingVertical: SPACING.md, borderRadius: BORDER_RADIUS.md, alignItems: 'center', marginTop: SPACING.lg },
  submitBtnText: { color: 'white', fontWeight: TYPOGRAPHY.weights.semibold as any, fontSize: TYPOGRAPHY.sizes.base },
});
