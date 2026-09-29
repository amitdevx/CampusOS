import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';

export default function ClassesScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>My Timetable</Text>
      <View style={styles.card}>
        <Text style={styles.subject}>Advanced Java</Text>
        <Text style={styles.details}>Room 304 • 10:00 AM</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.subject}>Operating Systems</Text>
        <Text style={styles.details}>Room 305 • 11:30 AM</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  content: { padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#1f2937' },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12 },
  subject: { fontSize: 18, fontWeight: '600', color: '#2563eb' },
  details: { fontSize: 14, color: '#6b7280', marginTop: 4 }
});
