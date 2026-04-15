import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Card, LoadingSpinner, EmptyState } from '../../components/ui';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/theme';

export default function StudentVenuesScreen() {
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['venues', search],
    queryFn: async () => {
      const url = search
        ? `${process.env.EXPO_PUBLIC_API_URL}/api/venues?search=${encodeURIComponent(search)}`
        : `${process.env.EXPO_PUBLIC_API_URL}/api/venues`;
      const r = await fetch(url);
      return r.json();
    }
  });

  const venues = data?.data || [];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Class Venues</Text>
        <TextInput style={styles.searchInput} placeholder="Search by name, building..." value={search} onChangeText={setSearch} placeholderTextColor={COLORS.gray[400]} />

        {isLoading ? <LoadingSpinner /> : venues.length === 0 ? (
          <EmptyState title="No Venues" message="No class venues found" />
        ) : (
          <View style={styles.list}>
            {venues.map((v: any) => (
              <Card key={v.id} style={styles.venueCard}>
                <View style={styles.venueImagePlaceholder}>
                  <Text style={styles.buildingIcon}>🏛️</Text>
                </View>
                <View style={styles.venueInfo}>
                  <Text style={styles.venueName}>{v.name}</Text>
                  {v.building && <Text style={styles.venueDetail}>{v.building}{v.floor ? `, Floor ${v.floor}` : ''}</Text>}
                  <Text style={styles.venueDetail}>Capacity: {v.capacity} | Room: {v.room_number || 'N/A'}</Text>
                  {v.latitude && v.longitude && (
                    <TouchableOpacity onPress={() => Linking.openURL(`https://www.google.com/maps?q=${v.latitude},${v.longitude}`)}>
                      <Text style={styles.directionsLink}>Get Directions</Text>
                    </TouchableOpacity>
                  )}
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
  title: { fontSize: TYPOGRAPHY.sizes['2xl'], fontWeight: TYPOGRAPHY.weights.bold as any, color: COLORS.text.primary, marginBottom: SPACING.md },
  searchInput: { backgroundColor: 'white', borderWidth: 1, borderColor: COLORS.gray[300], borderRadius: BORDER_RADIUS.md, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, fontSize: TYPOGRAPHY.sizes.base, marginBottom: SPACING.lg, color: COLORS.text.primary },
  list: { gap: SPACING.md },
  venueCard: { flexDirection: 'row', marginBottom: SPACING.md },
  venueImagePlaceholder: { width: 80, height: 80, backgroundColor: COLORS.gray[200], borderRadius: BORDER_RADIUS.md, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md },
  buildingIcon: { fontSize: 32 },
  venueInfo: { flex: 1 },
  venueName: { fontSize: TYPOGRAPHY.sizes.base, fontWeight: TYPOGRAPHY.weights.semibold as any, color: COLORS.text.primary, marginBottom: SPACING.xs },
  venueDetail: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.text.secondary, marginBottom: 2 },
  directionsLink: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.primary[600], fontWeight: TYPOGRAPHY.weights.medium as any, marginTop: SPACING.xs },
});
