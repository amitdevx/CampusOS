import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { getMe, setAuthToken } from '@campusos/api-client';

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const data = await getMe();
        setUser(data);
      } catch (e) {
        console.error("Failed to load profile", e);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);
  
  const handleLogout = async () => {
    await SecureStore.deleteItemAsync('userToken');
    setAuthToken(null);
    router.replace('/(auth)/login');
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.avatar} />
      <Text style={styles.name}>{user?.full_name || 'User Name'}</Text>
      <Text style={styles.role}>{user?.role || 'STUDENT'}</Text>
      <Text style={styles.email}>{user?.email}</Text>
      
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', alignItems: 'center', padding: 20 },
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#e5e7eb', marginTop: 40, marginBottom: 16 },
  name: { fontSize: 24, fontWeight: 'bold', color: '#1f2937' },
  role: { fontSize: 16, color: '#6b7280', marginBottom: 8 },
  email: { fontSize: 14, color: '#9ca3af', marginBottom: 40 },
  logoutBtn: { backgroundColor: '#fee2e2', padding: 16, borderRadius: 12, width: '100%', alignItems: 'center' },
  logoutText: { color: '#ef4444', fontWeight: 'bold', fontSize: 16 }
});
