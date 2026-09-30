import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { getMe, getMySchedule } from '@campusos/api-client';
import { Bell } from 'lucide-react-native';
import { Card, CardContent, CardHeader } from '../components/Card';
import { Button } from '../components/Button';
import { colors } from '../theme/colors';

export default function HomeScreen({ navigation }: any) {
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
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const isStudent = user?.role === 'STUDENT';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>Good morning,</Text>
            <Text style={styles.welcome}>{user?.full_name || 'User'}</Text>
          </View>
          <View style={styles.iconButton}>
            <Bell size={24} color={colors.text} />
            <View style={styles.badge} />
          </View>
        </View>

        <Card style={styles.mt24}>
          <CardHeader title="Today's Schedule" />
          <CardContent>
            {schedule.length === 0 ? (
              <Text style={styles.cardEmpty}>No classes scheduled for today.</Text>
            ) : (
              schedule.map((session, index) => (
                <View key={index} style={styles.sessionRow}>
                  <View style={styles.sessionTime}>
                    <Text style={styles.timeText}>
                      {new Date(session.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                  <View style={styles.sessionInfo}>
                    <Text style={styles.sessionSubject}>Subject #{session.subject_id}</Text>
                    <Text style={styles.sessionDetail}>Room {session.room}</Text>
                  </View>
                </View>
              ))
            )}
          </CardContent>
        </Card>

        {isStudent ? (
          <Button 
            title="Scan QR for Attendance" 
            onPress={() => navigation.navigate('Scan QR')} 
            style={styles.mt16}
          />
        ) : (
          <Button 
            title="Generate QR Session" 
            onPress={() => navigation.navigate('Generate QR')} 
            style={styles.mt16}
            variant="secondary"
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 20 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  greeting: { fontSize: 14, color: colors.textSecondary, marginBottom: 4 },
  welcome: { fontSize: 24, fontWeight: '700', color: colors.text },
  iconButton: {
    padding: 8,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.danger,
    borderWidth: 1,
    borderColor: colors.surface,
  },
  mt24: { marginTop: 24 },
  mt16: { marginTop: 16 },
  cardEmpty: { color: colors.textSecondary, fontSize: 15, textAlign: 'center', marginVertical: 12 },
  sessionRow: { 
    flexDirection: 'row', 
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sessionTime: {
    width: 70,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionSubject: { fontWeight: '600', color: colors.text, fontSize: 16 },
  sessionDetail: { color: colors.textSecondary, fontSize: 13, marginTop: 4 },
});
