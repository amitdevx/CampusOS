import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, SafeAreaView } from 'react-native';
import { Screen } from '../components/Screen';
import { getResources, bookResource, getMyBookings } from '@campusos/api-client';
import { colors } from '../theme/colors';
import { Badge } from '../components/Badge';
import { EmptyState, ErrorState } from '../components/States';

export default function ResourcesScreen() {
  const [resources, setResources] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [resData, bookData] = await Promise.all([
        getResources(),
        getMyBookings()
      ]);
      setResources(resData || []);
      setBookings(bookData || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async (resourceId: number) => {
    setBookingLoading(resourceId);
    try {
      const now = new Date();
      const end = new Date();
      end.setHours(end.getHours() + 1); // Default 1 hour booking

      await bookResource(resourceId, now.toISOString(), end.toISOString());
      Alert.alert('Success', 'Resource booked successfully!');
      loadData();
    } catch (e: any) {
      const msg = e?.response?.data?.detail || 'Failed to book resource';
      Alert.alert('Booking Error', msg);
    } finally {
      setBookingLoading(null);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Screen style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.header}>Campus Resources</Text>
        
        {/* My Bookings Section */}
        {bookings.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>My Bookings</Text>
            {bookings.map(b => {
              const res = resources.find(r => r.id === b.resource_id);
              return (
                <View key={b.id} style={styles.bookingCard}>
                  <View style={styles.bookingHeader}>
                    <Text style={styles.bookingTitle}>{res?.name || `Resource #${b.resource_id}`}</Text>
                    <Badge label={b.status} variant={b.status === 'APPROVED' ? 'success' : b.status === 'REJECTED' ? 'danger' : 'warning'} />
                  </View>
                  <Text style={styles.bookingTime}>
                    {new Date(b.start_time).toLocaleString()} - {new Date(b.end_time).toLocaleTimeString()}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Available Resources Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available to Book</Text>
          {resources.length === 0 ? (
            <EmptyState title="No resources found" description="There are currently no resources available for booking." />
          ) : (
            resources.map(r => (
              <View key={r.id} style={styles.resourceCard}>
                <View style={styles.resourceContent}>
                  <Text style={styles.resourceTitle}>{r.name}</Text>
                  <Text style={styles.resourceType}>{r.type}</Text>
                  {r.capacity && <Text style={styles.resourceCapacity}>Capacity: {r.capacity}</Text>}
                </View>
                <TouchableOpacity 
                  style={[styles.bookBtn, r.status !== 'AVAILABLE' && styles.bookBtnDisabled]}
                  onPress={() => handleBook(r.id)}
                  disabled={r.status !== 'AVAILABLE' || bookingLoading === r.id}
                >
                  {bookingLoading === r.id ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.bookBtnText}>{r.status === 'AVAILABLE' ? 'Book Now' : 'Unavailable'}</Text>
                  )}
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { padding: 20 },
  header: { fontSize: 28, fontWeight: '800', color: colors.text, marginBottom: 24 },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 16 },
  
  bookingCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bookingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  bookingTitle: { fontSize: 16, fontWeight: '600', color: colors.text },
  bookingTime: { fontSize: 13, color: colors.textSecondary },

  resourceCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  resourceContent: { flex: 1 },
  resourceTitle: { fontSize: 17, fontWeight: '700', color: colors.text, marginBottom: 4 },
  resourceType: { fontSize: 13, color: colors.primary, fontWeight: '600', textTransform: 'uppercase', marginBottom: 4 },
  resourceCapacity: { fontSize: 13, color: colors.textSecondary },
  
  bookBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    minWidth: 90,
    alignItems: 'center',
  },
  bookBtnDisabled: { backgroundColor: colors.border },
  bookBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});
