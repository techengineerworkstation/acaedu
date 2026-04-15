import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Card, Badge, LoadingSpinner } from '../../components/ui';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/theme';

export default function AdminCensusScreen() {
  const [roleFilter, setRoleFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['census', roleFilter],
    queryFn: async () => {
      const params = roleFilter ? `?role=${roleFilter}` : '';
      const r = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/admin/census${params}`);
      return r.json();
    }
  });

  const totals = data?.data?.totals || {};
  const users = data?.data?.users || [];
  const summary = data?.data?.summary || [];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Population Census</Text>

        {/* Totals */}
        <View style={styles.totalsRow}>
          {[
            { label: 'Students', value: totals.students || 0, color: COLORS.primary[500] },
            { label: 'Lecturers', value: totals.lecturers || 0, color: '#10B981' },
            { label: 'Total', value: totals.total || 0, color: COLORS.gray[700] }
          ].map((t, i) => (
            <View key={i} style={[styles.totalCard, { borderTopColor: t.color }]}>
              <Text style={styles.totalValue}>{t.value}</Text>
              <Text style={styles.totalLabel}>{t.label}</Text>
            </View>
          ))}
        </View>

        {/* Role filter */}
        <View style={styles.filterRow}>
          {['', 'student', 'lecturer'].map(role => (
            <TouchableOpacity key={role} style={[styles.filterChip, roleFilter === role && styles.filterChipActive]}
              onPress={() => setRoleFilter(role)}>
              <Text style={[styles.filterText, roleFilter === role && styles.filterTextActive]}>
                {role === '' ? 'All' : role.charAt(0).toUpperCase() + role.slice(1) + 's'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Department Summary */}
        {summary.length > 0 && (
          <Card style={styles.summaryCard}>
            <Text style={styles.sectionTitle}>By Department</Text>
            {summary.map((s: any, i: number) => (
              <View key={i} style={styles.summaryRow}>
                <Text style={styles.deptName}>{s.department_name || 'Unassigned'}</Text>
                <View style={styles.countsRow}>
                  <Text style={styles.countText}>{s.total_count} total</Text>
                  <Text style={styles.countText}>{s.male_count}M</Text>
                  <Text style={styles.countText}>{s.female_count}F</Text>
                </View>
              </View>
            ))}
          </Card>
        )}

        {/* User List */}
        {isLoading ? <LoadingSpinner /> : (
          <View style={styles.userList}>
            <Text style={styles.sectionTitle}>All Users ({users.length})</Text>
            {users.map((u: any) => (
              <TouchableOpacity key={u.id} style={styles.userCard}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{u.full_name?.charAt(0)}</Text>
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{u.full_name}</Text>
                  <Text style={styles.userEmail}>{u.email}</Text>
                  <View style={styles.userMeta}>
                    <Badge label={u.role} variant={u.role === 'lecturer' ? 'info' : 'success'} />
                    {u.gender && <Text style={styles.metaText}>{u.gender}</Text>}
                    {u.matriculation_number && <Text style={styles.metaText}>{u.matriculation_number}</Text>}
                  </View>
                </View>
              </TouchableOpacity>
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
  title: { fontSize: TYPOGRAPHY.sizes['2xl'], fontWeight: TYPOGRAPHY.weights.bold as any, color: COLORS.text.primary, marginBottom: SPACING.lg },
  totalsRow: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.lg },
  totalCard: { flex: 1, backgroundColor: 'white', padding: SPACING.md, borderRadius: BORDER_RADIUS.md, borderTopWidth: 3, alignItems: 'center', elevation: 1 },
  totalValue: { fontSize: TYPOGRAPHY.sizes['2xl'], fontWeight: TYPOGRAPHY.weights.bold as any, color: COLORS.text.primary },
  totalLabel: { fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.text.secondary },
  filterRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.lg },
  filterChip: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: BORDER_RADIUS.full, backgroundColor: COLORS.gray[200] },
  filterChipActive: { backgroundColor: COLORS.primary[600] },
  filterText: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.text.secondary },
  filterTextActive: { color: 'white' },
  summaryCard: { marginBottom: SPACING.lg },
  sectionTitle: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: TYPOGRAPHY.weights.semibold as any, color: COLORS.text.primary, marginBottom: SPACING.md },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.gray[200] },
  deptName: { fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.medium as any, color: COLORS.text.primary },
  countsRow: { flexDirection: 'row', gap: SPACING.md },
  countText: { fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.text.secondary },
  userList: { gap: SPACING.sm },
  userCard: { flexDirection: 'row', backgroundColor: 'white', padding: SPACING.md, borderRadius: BORDER_RADIUS.md, marginBottom: SPACING.sm, elevation: 1 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primary[100], alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md },
  avatarText: { color: COLORS.primary[700], fontWeight: TYPOGRAPHY.weights.semibold as any },
  userInfo: { flex: 1 },
  userName: { fontSize: TYPOGRAPHY.sizes.base, fontWeight: TYPOGRAPHY.weights.medium as any, color: COLORS.text.primary },
  userEmail: { fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.text.secondary },
  userMeta: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginTop: SPACING.xs },
  metaText: { fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.gray[400], textTransform: 'capitalize' },
});
