import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { getClasses, startAttendanceSession, closeAttendanceSession } from '@campusos/api-client';

export default function GenerateQRScreen() {
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [sessionData, setSessionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const data = await getClasses();
        setClasses(data);
        if (data.length > 0) setSelectedClass(data[0]);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, []);

  const handleGenerate = async () => {
    if (!selectedClass) return;
    try {
      const data = await startAttendanceSession(selectedClass.id);
      setSessionData(data);
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.detail || 'Failed to start session');
    }
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#2563eb" /></View>;
  }

  const qrData = sessionData ? JSON.stringify({
    v: 1, type: 'ATTENDANCE',
    session: sessionData.id,
    token: sessionData.qr_code_secret,
  }) : '';

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Generate QR Code</Text>
      
      {!sessionData ? (
        <View style={styles.card}>
          <Text style={styles.label}>Select Active Class</Text>
          {classes.length === 0 ? (
            <Text style={styles.empty}>No active classes found.</Text>
          ) : (
            <View>
              {classes.map(c => (
                <TouchableOpacity 
                  key={c.id} 
                  style={[styles.classItem, selectedClass?.id === c.id && styles.selectedItem]}
                  onPress={() => setSelectedClass(c)}
                >
                  <Text style={[styles.classText, selectedClass?.id === c.id && styles.selectedText]}>
                    Subject #{c.subject_id} - Room {c.room}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={styles.button} onPress={handleGenerate}>
                <Text style={styles.buttonText}>Start Attendance Session</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ) : (
        <View style={styles.qrContainer}>
          <View style={styles.qrBox}>
            <QRCode
              value={qrData}
              size={250}
            />
          </View>
          <Text style={styles.instruction}>
            Have students scan this code to mark their attendance.
          </Text>
          <TouchableOpacity style={styles.secondaryButton} onPress={async () => {
            try {
              await closeAttendanceSession(sessionData.id);
            } catch(e) {
              console.error(e);
            }
            setSessionData(null);
          }}>
            <Text style={styles.secondaryText}>Close Session</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6', padding: 16, paddingTop: 60 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { fontSize: 24, fontWeight: 'bold', color: '#111827', marginBottom: 16 },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 8, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  label: { fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 12 },
  empty: { color: '#6b7280', fontStyle: 'italic' },
  classItem: { padding: 12, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, marginBottom: 8 },
  selectedItem: { borderColor: '#2563eb', backgroundColor: '#eff6ff' },
  classText: { color: '#374151' },
  selectedText: { color: '#2563eb', fontWeight: 'bold' },
  button: { backgroundColor: '#2563eb', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 16 },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  qrContainer: { alignItems: 'center', marginTop: 40 },
  qrBox: { backgroundColor: '#fff', padding: 20, borderRadius: 12, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  instruction: { marginTop: 24, textAlign: 'center', color: '#374151', fontSize: 16, paddingHorizontal: 20 },
  secondaryButton: { marginTop: 32, padding: 12 },
  secondaryText: { color: '#ef4444', fontWeight: '600', fontSize: 16 },
});
