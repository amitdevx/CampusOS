import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, SafeAreaView } from 'react-native';
import { getEvents } from '@campusos/api-client';
import { MapPin, Calendar as CalendarIcon, Info } from 'lucide-react-native';
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
      <Text style={styles.header}>Campus Events</Text>
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
            <View style={styles.eventCard}>
              <View style={styles.dateBadge}>
                <Text style={styles.dateDay}>{new Date(item.event_date).getDate()}</Text>
                <Text style={styles.dateMonth}>{new Date(item.event_date).toLocaleString('default', { month: 'short' }).toUpperCase()}</Text>
              </View>
              
              <View style={styles.eventDetails}>
                <Text style={styles.title}>{item.title}</Text>
                
                <View style={styles.infoRow}>
                  <MapPin size={14} color={colors.textSecondary} style={styles.icon} />
                  <Text style={styles.infoText}>{item.location}</Text>
                </View>
                
                <View style={styles.infoRow}>
                  <CalendarIcon size={14} color={colors.textSecondary} style={styles.icon} />
                  <Text style={styles.infoText}>{new Date(item.event_date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</Text>
                </View>

                {item.description ? (
                  <View style={styles.descRow}>
                    <Info size={14} color={colors.textMuted} style={styles.icon} />
                    <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
                  </View>
                ) : null}
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { fontSize: 28, fontWeight: '800', color: colors.text, marginHorizontal: 20, marginVertical: 20 },
  listContent: { paddingHorizontal: 20, paddingBottom: 40 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { color: colors.textSecondary, fontSize: 16 },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateBadge: {
    backgroundColor: '#eff6ff',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  dateDay: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.primary,
  },
  dateMonth: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primaryDark,
    marginTop: 2,
    letterSpacing: 1,
  },
  eventDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  title: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 8 },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  descRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  icon: { marginRight: 6, marginTop: 2 },
  infoText: { fontSize: 14, color: colors.textSecondary, fontWeight: '500' },
  description: { fontSize: 14, color: colors.textSecondary, flex: 1, lineHeight: 20 },
});
