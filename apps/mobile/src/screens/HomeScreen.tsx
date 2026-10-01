import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { getMe, getMySchedule } from '@campusos/api-client';
import { Bell, MapPin, Clock } from 'lucide-react-native';
import { Screen } from '../components/Screen';
import { Card, CardContent, CardHeader } from '../components/Card';
import { Button } from '../components/Button';
import { colors } from '../theme/colors';
import { useCampusWebSocket } from '../hooks/useCampusWebSocket';

export default function HomeScreen({ navigation }: any) {
  const [user, setUser] = useState<any>(null);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { notifications } = useCampusWebSocket();

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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning,';
    if (hour < 18) return 'Good afternoon,';
    return 'Good evening,';
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const isStudent = user?.role === 'STUDENT';

  return (
    <Screen style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.welcome}>{user?.full_name || 'User'}</Text>
          </View>
          <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
            <Bell size={24} color={colors.text} />
            {notifications.length > 0 && <View style={styles.badge} />}
          </TouchableOpacity>
        </View>

        <Card style={styles.mt24}>
          <CardHeader title="Today's Schedule" />
          <CardContent>
            {schedule.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.cardEmpty}>No classes scheduled for today.</Text>
              </View>
            ) : (
              schedule.map((session, index) => (
                <View key={index} style={[styles.sessionRow, index === schedule.length - 1 && styles.noBorder]}>
                  <View style={styles.sessionTimeCol}>
                    <Text style={styles.timeText}>
                      {new Date(session.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                  <View style={styles.sessionCard}>
                    <Text style={styles.sessionSubject}>Subject #{session.subject_id}</Text>
                    <View style={styles.sessionDetailsRow}>
                      <View style={styles.detailItem}>
                        <Clock size={12} color={colors.textSecondary} style={styles.detailIcon} />
                        <Text style={styles.sessionDetail}>
                          {new Date(session.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                      </View>
                      <View style={styles.detailItem}>
                        <MapPin size={12} color={colors.textSecondary} style={styles.detailIcon} />
                        <Text style={styles.sessionDetail}>Room {session.room}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))
            )}
          </CardContent>
        </Card>

        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          {isStudent ? (
            <Button 
              title="Scan QR for Attendance" 
              onPress={() => navigation.navigate('Scan QR')} 
              style={styles.actionButton}
            />
          ) : (
            <Button 
              title="Generate QR Session" 
              onPress={() => navigation.navigate('Generate QR')} 
              style={styles.actionButton}
              variant="primary"
            />
          )}
        </View>
      </ScrollView>
    </Screen>
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
  greeting: { fontSize: 16, color: colors.textSecondary, marginBottom: 4, fontWeight: '500' },
  welcome: { fontSize: 28, fontWeight: '800', color: colors.text, letterSpacing: -0.5 },
  iconButton: {
    padding: 10,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.danger,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  mt24: { marginTop: 24 },
  emptyState: { paddingVertical: 20 },
  cardEmpty: { color: colors.textSecondary, fontSize: 15, textAlign: 'center' },
  sessionRow: { 
    flexDirection: 'row', 
    alignItems: 'stretch',
    marginBottom: 16,
  },
  noBorder: { marginBottom: 0 },
  sessionTimeCol: {
    width: 75,
    alignItems: 'flex-start',
    paddingTop: 12,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  sessionCard: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  sessionSubject: { fontWeight: '700', color: colors.text, fontSize: 16, marginBottom: 8 },
  sessionDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  detailIcon: { marginRight: 4 },
  sessionDetail: { color: colors.textSecondary, fontSize: 13, fontWeight: '500' },
  quickActionsContainer: {
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  actionButton: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
});
