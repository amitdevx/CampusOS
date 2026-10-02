import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { getMe, getMySchedule } from '@campusos/api-client';
import { Bell, MapPin, QrCode } from 'lucide-react-native';
import { Screen } from '../components/Screen';
import { colors } from '../theme/colors';
import { useCampusWebSocket } from '../hooks/useCampusWebSocket';

const { width } = Dimensions.get('window');

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
    <Screen style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Text style={styles.brandText}>ResoSync</Text>
          <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
            <Bell size={20} color={colors.text} />
            {notifications.length > 0 && <View style={styles.badge} />}
          </TouchableOpacity>
        </View>

        {/* THE DIGITAL ID PASS */}
        <View style={styles.idCard}>
          <View style={styles.idCardInner}>
            <View style={styles.idHeader}>
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>{user?.role || 'USER'}</Text>
              </View>
              <View style={styles.statusDot} />
            </View>
            
            <View style={styles.idBody}>
              <Text style={styles.idName}>{user?.full_name || 'Guest User'}</Text>
              <Text style={styles.idEmail}>{user?.email || 'guest@campus.edu'}</Text>
            </View>

            <TouchableOpacity 
              style={styles.passButton}
              activeOpacity={0.8}
              onPress={() => navigation.navigate(isStudent ? 'Scan QR' : 'Generate QR')}
            >
              <QrCode size={18} color="#FFFFFF" />
              <Text style={styles.passButtonText}>
                {isStudent ? 'Scan Campus Pass' : 'Generate Session Pass'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* TIMELINE */}
        <View style={styles.timelineSection}>
          <Text style={styles.sectionTitle}>TODAY'S TIMELINE</Text>
          
          {schedule.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.cardEmpty}>No schedule items remaining today.</Text>
            </View>
          ) : (
            <View style={styles.timelineContainer}>
              {schedule.map((session, index) => (
                <View key={index} style={styles.timelineRow}>
                  <View style={styles.timeCol}>
                    <Text style={styles.timeText}>
                      {new Date(session.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                    <Text style={styles.timeTextMuted}>
                      {new Date(session.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                  
                  <View style={styles.timelineNode}>
                    <View style={styles.nodeDot} />
                    {index !== schedule.length - 1 && <View style={styles.nodeLine} />}
                  </View>

                  <View style={styles.timelineContent}>
                    <Text style={styles.sessionSubject}>{session.subject_name || 'Unknown Subject'}</Text>
                    <View style={styles.locationRow}>
                      <MapPin size={12} color={colors.textSecondary} />
                      <Text style={styles.sessionDetail}>Room {session.room}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAFAFA' },
  content: { padding: 20 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  brandText: { fontSize: 22, fontWeight: '900', color: '#09090B', letterSpacing: -0.5 },
  iconButton: {
    padding: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E4E4E7',
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  
  /* ID CARD STYLES */
  idCard: {
    backgroundColor: '#09090B',
    borderRadius: 24,
    padding: 4,
    shadowColor: '#09090B',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
    marginBottom: 40,
  },
  idCardInner: {
    backgroundColor: '#18181B',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  idHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  roleBadge: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  roleText: {
    color: '#D4D4D8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  idBody: {
    marginBottom: 32,
  },
  idName: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  idEmail: {
    color: '#A1A1AA',
    fontSize: 14,
  },
  passButton: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  passButtonText: {
    color: '#09090B',
    fontSize: 15,
    fontWeight: '700',
  },

  /* TIMELINE STYLES */
  timelineSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#71717A',
    letterSpacing: 1.5,
    marginBottom: 20,
  },
  timelineContainer: {
    paddingLeft: 4,
  },
  timelineRow: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  timeCol: {
    width: 65,
    alignItems: 'flex-start',
    paddingTop: 2,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#09090B',
  },
  timeTextMuted: {
    fontSize: 12,
    color: '#A1A1AA',
    marginTop: 2,
  },
  timelineNode: {
    width: 24,
    alignItems: 'center',
    marginHorizontal: 12,
  },
  nodeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#09090B',
    borderWidth: 3,
    borderColor: '#FAFAFA',
    zIndex: 2,
  },
  nodeLine: {
    position: 'absolute',
    top: 12,
    bottom: -36,
    width: 2,
    backgroundColor: '#E4E4E7',
    zIndex: 1,
  },
  timelineContent: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    marginTop: -8,
  },
  sessionSubject: {
    fontWeight: '700',
    color: '#09090B',
    fontSize: 15,
    marginBottom: 6,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sessionDetail: {
    color: '#71717A',
    fontSize: 13,
    fontWeight: '500',
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E4E4E7',
    borderStyle: 'dashed',
    borderRadius: 16,
  },
  cardEmpty: {
    color: '#A1A1AA',
    fontSize: 14,
    fontWeight: '500',
  },
});
