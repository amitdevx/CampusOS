import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const router = useRouter();
  
  const handleLogout = () => {
    router.replace('/(auth)/login');
  };

  return (
    <View style={styles.container}>
      <View style={styles.avatar} />
      <Text style={styles.name}>Amit Divekar</Text>
      <Text style={styles.role}>Student • TYBSc</Text>
      
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
  role: { fontSize: 16, color: '#6b7280', marginBottom: 40 },
  logoutBtn: { backgroundColor: '#fee2e2', padding: 16, borderRadius: 12, width: '100%', alignItems: 'center' },
  logoutText: { color: '#ef4444', fontWeight: 'bold', fontSize: 16 }
});
