import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  Modal,
  RefreshControl,
} from 'react-native';
import { getMe, getMySchedule } from '@campusos/api-client';
import { Bell, MapPin, QrCode } from 'lucide-react-native';
import { Screen } from '../components/Screen';
import { colors } from '../theme/colors';
import { useCampusWebSocket } from '../hooks/useCampusWebSocket';
import * as SecureStore from 'expo-secure-store';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }: any) {
  const [user, setUser] = useState<any>(null);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNotifs, setShowNotifs] = useState(false);
  const { notifications } = useCampusWebSocket();
  const unreadCount = notifications.filter((n: any) => !n.is_read).length;

  const [isOffline, setIsOffline] = useState(false);

  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async (isRefresh = false) => {
    try {
      if (!isRefresh) {
        // Try loading cache first for instant UI
        const cachedUser = await SecureStore.getItemAsync('offline_user');
        const cachedSchedule = await SecureStore.getItemAsync('offline_schedule');
        if (cachedUser) setUser(JSON.parse(cachedUser));
        if (cachedSchedule) setSchedule(JSON.parse(cachedSchedule));
        if (cachedUser || cachedSchedule) setLoading(false);
      }

      const [userData, scheduleData] = await Promise.all([
        getMe(),
        getMySchedule(),
      ]);
      
      setUser(userData);
      await SecureStore.setItemAsync('offline_user', JSON.stringify(userData));
      
      // Filter schedule strictly to TODAY
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      const todaysClasses = (scheduleData || []).filter((s: any) => {
        if (!s.start_time) return false;
        return s.start_time.startsWith(todayStr);
      }).sort((a: any, b: any) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
      
      setSchedule(todaysClasses);
      await SecureStore.setItemAsync('offline_schedule', JSON.stringify(todaysClasses));
      setIsOffline(false);
    } catch (err) {
      console.log("HomeScreen network error, falling back to cache");
      setIsOffline(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData(true);
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
      <ScrollView 
        contentContainerStyle={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.headerRow}>
          <Text style={styles.brandText}>ResoSync</Text>
          <TouchableOpacity style={styles.iconButton} activeOpacity={0.7} onPress={() => setShowNotifs(true)}>
            <Bell size={20} color={colors.text} />
            {unreadCount > 0 && <View style={styles.badge} />}
          </TouchableOpacity>
        </View>

        {isOffline && (
          <View style={{ backgroundColor: '#FEF3C7', padding: 12, borderRadius: 8, marginBottom: 16 }}>
            <Text style={{ color: '#92400E', fontSize: 13, fontWeight: '500', textAlign: 'center' }}>
              You are offline. Showing cached data.
            </Text>
          </View>
        )}

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

            {(user?.role === 'STUDENT' || user?.role === 'TEACHER') && (
              <TouchableOpacity 
                style={styles.passButton}
                activeOpacity={0.8}
                onPress={() => navigation.navigate(user?.role === 'STUDENT' ? 'Scan QR' : 'Generate QR')}
              >
                <QrCode size={18} color="#FFFFFF" />
                <Text style={styles.passButtonText}>
                  {user?.role === 'STUDENT' ? 'Scan Campus Pass' : 'Generate Session Pass'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* QUICK ACTIONS */}
        {(user?.role === 'STUDENT' || user?.role === 'TEACHER') && (
          <View style={{ marginBottom: 24, paddingHorizontal: 20 }}>
            <Text style={styles.sectionTitle}>QUICK ACTIONS</Text>
            <TouchableOpacity 
              style={{ backgroundColor: '#F4F4F5', padding: 16, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: '#E4E4E7' }}
              onPress={() => navigation.navigate('Resources')}
            >
              <MapPin size={20} color="#09090B" />
              <Text style={{ fontWeight: '600', fontSize: 15, color: '#09090B' }}>Book Campus Resource</Text>
            </TouchableOpacity>
          </View>
        )}

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
                    <Text style={styles.sessionSubject} numberOfLines={1} ellipsizeMode="tail">{session.subject_name || 'Unknown Subject'}</Text>
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
    
      <Modal visible={showNotifs} transparent animationType="fade">
        <View style={{flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center'}}>
          <View style={{width: '85%', backgroundColor: '#fff', borderRadius: 16, padding: 20, maxHeight: '70%'}}>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16}}>
              <Text style={{fontSize: 18, fontWeight: 'bold'}}>Notifications</Text>
              <TouchableOpacity onPress={() => setShowNotifs(false)}>
                <Text style={{color: 'red', fontWeight: 'bold'}}>Close</Text>
              </TouchableOpacity>
            </View>
            <ScrollView>
              {notifications.length === 0 ? (
                <Text style={{color: '#888', textAlign: 'center', marginTop: 20}}>No active alerts.</Text>
              ) : (
                notifications.map((n, i) => (
                  <View key={n.id || i} style={{padding: 12, backgroundColor: '#f5f5f5', borderRadius: 8, marginBottom: 8}}>
                    <Text style={{fontWeight: 'bold', fontSize: 14}}>{n.title || 'Notification'}</Text>
                    <Text style={{fontSize: 13, color: '#555', marginTop: 4}}>{n.message || n}</Text>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
  
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
