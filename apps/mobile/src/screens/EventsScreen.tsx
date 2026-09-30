import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, SafeAreaView } from 'react-native';
import { getEvents } from '@campusos/api-client';
import { Card, CardContent } from '../components/Card';
import { colors } from '../theme/colors';

export default function EventsScreen() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await getEvents();
        setEvents(data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Upcoming Events</Text>
      {events.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.empty}>No upcoming events found.</Text>
        </View>
      ) : (
        <FlatList
          contentContainerStyle={styles.listContent}
          data={events}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <Card style={styles.mb12}>
              <CardContent>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.location}>Location: {item.location}</Text>
                <Text style={styles.time}>{new Date(item.event_date).toLocaleDateString()}</Text>
                {item.description ? <Text style={styles.description}>{item.description}</Text> : null}
              </CardContent>
            </Card>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { fontSize: 24, fontWeight: '700', color: colors.text, marginHorizontal: 20, marginVertical: 16 },
  listContent: { paddingHorizontal: 20 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { color: colors.textSecondary, fontSize: 16 },
  mb12: { marginBottom: 12 },
  title: { fontSize: 18, fontWeight: '600', color: colors.text },
  location: { fontSize: 14, color: colors.textSecondary, marginTop: 4 },
  time: { fontSize: 14, color: colors.primary, marginTop: 4, fontWeight: '500' },
  description: { fontSize: 14, color: colors.textSecondary, marginTop: 8 },
});
