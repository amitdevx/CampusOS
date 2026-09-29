import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
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
          getMySchedule()
        ]);
        setUser(userData);
        setSchedule(scheduleData);
      } catch (e) {
        console.error("Failed to load home data", e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.welcomeText}>Welcome, {user?.full_name || 'Student'}!</Text>
      <Text style={styles.subtitle}>Your ₹0 digital campus platform.</Text>
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Today's Classes</Text>
        {schedule.length === 0 ? (
          <Text style={styles.cardText}>No upcoming classes. You're all caught up!</Text>
        ) : (
          schedule.map((session, index) => (
            <View key={index} style={{ marginTop: 8 }}>
              <Text style={{ fontWeight: '600' }}>Subject ID: {session.subject_id}</Text>
              <Text style={{ color: '#6b7280' }}>Room {session.room} • {new Date(session.start_time).toLocaleTimeString()}</Text>
            </View>
          ))
        )}
      </View>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Scan QR Attendance</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  content: {
    padding: 20,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#4b5563',
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  cardText: {
    color: '#6b7280',
  },
  button: {
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
