import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { getAllBookings, updateBookingStatus } from '@campusos/api-client';
import { Screen } from '../components/Screen';
import { colors } from '../theme/colors';

export default function AdminHomeScreen() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBookings = async () => {
    try {
      const data = await getAllBookings();
      // Show pending first
      setBookings((data || []).filter((b: any) => b.status === 'PENDING'));
    } catch (e) {
      console.log('Failed to fetch bookings', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  const handleAction = async (id: number, status: string) => {
    try {
      await updateBookingStatus(id, status);
      fetchBookings(); // refresh list
    } catch (e) {
      console.error("Action failed", e);
      alert("Failed to update booking status.");
    }
  };

  return (
    <Screen style={styles.container}>
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <View style={styles.header}>
          <Text style={styles.title}>Admin Dashboard</Text>
          <Text style={styles.subtitle}>Pending Resource Requests</Text>
        </View>

        {loading && !refreshing ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
        ) : bookings.length === 0 ? (
          <Text style={styles.empty}>No pending requests.</Text>
        ) : (
          bookings.map((booking) => (
            <View key={booking.id} style={styles.card}>
              <Text style={styles.resourceName}>Resource #{booking.resource_id}</Text>
              <Text style={styles.dateText}>{new Date(booking.start_time).toLocaleString()}</Text>
              <View style={{ flexDirection: 'row', marginTop: 12, gap: 8 }}>
                <TouchableOpacity onPress={() => handleAction(booking.id, 'APPROVED')} style={[styles.actionBtn, { backgroundColor: '#10B981' }]}>
                  <Text style={styles.actionText}>Approve</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleAction(booking.id, 'REJECTED')} style={[styles.actionBtn, { backgroundColor: '#EF4444' }]}>
                  <Text style={styles.actionText}>Reject</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: { padding: 20, paddingTop: 40 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#09090B' },
  subtitle: { fontSize: 16, color: '#71717A', marginTop: 4 },
  empty: { textAlign: 'center', color: '#A1A1AA', marginTop: 40 },
  card: { backgroundColor: 'white', padding: 16, marginHorizontal: 20, marginBottom: 12, borderRadius: 12, borderWidth: 1, borderColor: '#E4E4E7' },
  resourceName: { fontSize: 16, fontWeight: '600', color: '#09090B' },
  dateText: { fontSize: 14, color: '#52525B', marginTop: 4 },
  statusBadge: { alignSelf: 'flex-start', backgroundColor: '#FEF08A', color: '#854D0E', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, fontSize: 12, fontWeight: '600', marginTop: 12 },
  actionBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 },
  actionText: { color: 'white', fontWeight: '600', fontSize: 13 }
});
