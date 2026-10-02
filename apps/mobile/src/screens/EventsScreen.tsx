import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { Screen } from '../components/Screen';
import { getEvents, registerForEvent, getMyEventRegistrations } from '@campusos/api-client';
import { MapPin, Calendar as CalendarIcon, Info, CheckCircle } from 'lucide-react-native';
import { colors } from '../theme/colors';

export default function EventsScreen() {
  const [events, setEvents] = useState<any[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [registeringId, setRegisteringId] = useState<number | null>(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const [eventsData, regsData] = await Promise.all([
        getEvents(),
        getMyEventRegistrations()
      ]);
      setEvents(eventsData || []);
      setRegistrations(regsData || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (eventId: number) => {
    setRegisteringId(eventId);
    try {
      await registerForEvent(eventId);
      const regsData = await getMyEventRegistrations();
      setRegistrations(regsData || []);
    } catch (e: any) {
      Alert.alert('Registration Failed', e.response?.data?.detail || 'Could not register for this event.');
    } finally {
      setRegisteringId(null);
    }
  };

  const isRegistered = (eventId: number) => {
    return registrations.some(r => r.event_id === eventId);
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
          renderItem={({ item }) => {
            const registered = isRegistered(item.id);
            const registering = registeringId === item.id;

            return (
              <View style={styles.eventCard}>
                <View style={styles.cardHeader}>
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
                      <Text style={styles.infoText}>{new Date(item.event_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                    </View>
                  </View>
                </View>

                {item.description ? (
                  <View style={styles.descRow}>
                    <Info size={14} color={colors.textMuted} style={styles.icon} />
                    <Text style={styles.description}>{item.description}</Text>
                  </View>
                ) : null}

                <View style={styles.actionRow}>
                  {registered ? (
                    <View style={styles.registeredBadge}>
                      <CheckCircle size={16} color="#10B981" />
                      <Text style={styles.registeredText}>REGISTERED</Text>
                    </View>
                  ) : (
                    <TouchableOpacity 
                      style={[styles.registerBtn, registering && styles.registerBtnDisabled]} 
                      onPress={() => handleRegister(item.id)}
                      disabled={registering}
                    >
                      {registering ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Text style={styles.registerBtnText}>REGISTER</Text>
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          }}
        />
      )}
    </Screen>
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
  cardHeader: {
    flexDirection: 'row',
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
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  icon: { marginRight: 6, marginTop: 2 },
  infoText: { fontSize: 14, color: colors.textSecondary, fontWeight: '500' },
  description: { fontSize: 14, color: colors.textSecondary, flex: 1, lineHeight: 20 },
  actionRow: {
    marginTop: 16,
  },
  registerBtn: {
    backgroundColor: '#09090B',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  registerBtnDisabled: {
    opacity: 0.7,
  },
  registerBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  registeredBadge: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  registeredText: {
    color: '#10b981',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    marginLeft: 8,
  }
});
