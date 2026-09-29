import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { getMe, getMySchedule } from '@campusos/api-client';

export default function HomeScreen() {
  const [user, setUser] = useState<any>(null);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [userData, scheduleData] = await Promise.all([
          getMe(),
          getMySchedule(),
        ]);
        setUser(userData);
        setSchedule(scheduleData || []);
      } catch {
        // Fail silently on home screen - user sees empty state
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.welcome}>Welcome, {user?.full_name || 'Student'}</Text>
      <Text style={styles.subtitle}>CampusOS</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Today's Classes</Text>
        {schedule.length === 0 ? (
          <Text style={styles.cardEmpty}>No classes scheduled for today.</Text>
        ) : (
          schedule.map((session, index) => (
            <View key={index} style={styles.sessionRow}>
              <Text style={styles.sessionSubject}>Subject #{session.subject_id}</Text>
              <Text style={styles.sessionDetail}>
                Room {session.room} - {new Date(session.start_time).toLocaleTimeString()}
              </Text>
            </View>
          ))
        )}
      </View>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Scan QR for Attendance</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 20 },
  welcome: { fontSize: 22, fontWeight: '600', color: '#1f2937', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#4b5563', marginBottom: 24 },
  card: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  cardTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12, color: '#111827' },
  cardEmpty: { color: '#6b7280', fontSize: 14 },
  sessionRow: { marginTop: 8 },
  sessionSubject: { fontWeight: '600', color: '#111827' },
  sessionDetail: { color: '#6b7280', fontSize: 13, marginTop: 2 },
  button: {
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
});
