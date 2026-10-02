import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Screen } from '../components/Screen';
import { getMySchedule, startAttendanceSession, closeAttendanceSession } from '@campusos/api-client';
import { Clock, MapPin, CheckCircle, X } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { EmptyState, ErrorState } from '../components/States';

type GenState = 'idle' | 'active' | 'closed';

export default function GenerateQRScreen() {
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [sessionData, setSessionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [closing, setClosing] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  const [genState, setGenState] = useState<GenState>('idle');

  useEffect(() => {
    getMySchedule()
      .then((data) => {
        const now = new Date();
        const active = (data || []).filter((c: any) => new Date(c.end_time) > now);
        setClasses(active);
        if (active.length > 0) setSelectedClass(active[0]);
      })
      .catch(() => setFetchError(true))
      .finally(() => setLoading(false));
  }, []);

  const handleGenerate = async () => {
    if (!selectedClass) return;
    setGenerating(true);
    try {
      const data = await startAttendanceSession(selectedClass.id);
      setSessionData(data);
      setGenState('active');
    } catch (e: any) {
      const msg = e?.response?.data?.detail || 'Could not start session. Check that the class is within its scheduled time window.';
      Alert.alert('Session Error', msg);
    } finally {
      setGenerating(false);
    }
  };

  const handleClose = async () => {
    if (!sessionData) return;
    setClosing(true);
    try {
      await closeAttendanceSession(sessionData.id);
      setGenState('closed');
    } catch (e) {
      console.error(e);
    } finally {
      setClosing(false);
    }
  };

  const handleReset = () => {
    setSessionData(null);
    setGenState('idle');
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (fetchError) {
    return (
      <Screen style={styles.container}>
        <ErrorState message="Could not load your schedule. Check your connection." />
      </Screen>
    );
  }

  const qrData = sessionData
    ? JSON.stringify({ v: 1, type: 'ATTENDANCE', session: sessionData.id, token: sessionData.qr_code_secret })
    : '';

  // Session Closed confirmation screen
  if (genState === 'closed') {
    return (
      <Screen style={styles.container}>
        <View style={styles.resultContainer}>
          <View style={[styles.resultIconWrap, { backgroundColor: '#F0FDF4' }]}>
            <CheckCircle size={56} color={colors.success} strokeWidth={1.5} />
          </View>
          <Text style={styles.resultTitle}>Session Closed</Text>
          <Text style={styles.resultSubtitle}>The attendance session has ended.</Text>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.primary }]} onPress={handleReset}>
            <Text style={styles.actionButtonText}>Start New Session</Text>
          </TouchableOpacity>
        </View>
      </Screen>
    );
  }

  return (
    <Screen style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.screenTitle}>Attendance QR</Text>

        {genState === 'active' && sessionData ? (
          // Active QR Session View
          <View>
            <View style={styles.qrWrapper}>
              <View style={styles.qrCard}>
                <QRCode value={qrData} size={220} />
              </View>
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>LIVE</Text>
              </View>
            </View>

            <View style={styles.infoSection}>
              <Text style={styles.infoLabel}>Active Session</Text>
              <Text style={styles.infoTitle}>
                {selectedClass?.subject_name || "Unknown Subject"}
              </Text>
              <View style={styles.infoRow}>
                <MapPin size={14} color={colors.textSecondary} />
                <Text style={styles.infoText}>Room {selectedClass?.room}</Text>
              </View>
              <View style={styles.infoRow}>
                <Clock size={14} color={colors.textSecondary} />
                <Text style={styles.infoText}>
                  {new Date(selectedClass?.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  {' - '}
                  {new Date(selectedClass?.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            </View>

            <Text style={styles.instructions}>
              Ask students to open the ResoSync app and scan this code.
            </Text>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.danger }]}
              onPress={handleClose}
              disabled={closing}
            >
              {closing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.actionButtonText}>Close Session</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          // Class Selection View
          <View>
            <Text style={styles.sectionLabel}>Select Class</Text>
            {classes.length === 0 ? (
              <EmptyState
                title="No classes in your schedule"
                description="Classes will appear here once they are added to your timetable."
              />
            ) : (
              <>
                {classes.map((c) => (
                  <TouchableOpacity
                    key={c.id}
                    style={[styles.classCard, selectedClass?.id === c.id && styles.classCardSelected]}
                    onPress={() => setSelectedClass(c)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.classCardContent}>
                      <Text style={[styles.classCardTitle, selectedClass?.id === c.id && styles.classCardTitleSelected]}>
                        {c.subject_name || "Unknown Subject"}
                      </Text>
                      <View style={styles.classCardMeta}>
                        <View style={styles.infoRow}>
                          <MapPin size={12} color={selectedClass?.id === c.id ? colors.primary : colors.textSecondary} />
                          <Text style={[styles.classCardMeta_, selectedClass?.id === c.id && styles.classCardMetaSelected]}>
                            Room {c.room}
                          </Text>
                        </View>
                        <View style={styles.infoRow}>
                          <Clock size={12} color={selectedClass?.id === c.id ? colors.primary : colors.textSecondary} />
                          <Text style={[styles.classCardMeta_, selectedClass?.id === c.id && styles.classCardMetaSelected]}>
                            {new Date(c.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {' - '}
                            {new Date(c.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Text>
                        </View>
                      </View>
                    </View>
                    {selectedClass?.id === c.id && (
                      <View style={styles.selectedCheckmark}>
                        <CheckCircle size={20} color={colors.primary} />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}

                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: colors.primary, marginTop: 8 }]}
                  onPress={handleGenerate}
                  disabled={generating || !selectedClass}
                >
                  {generating ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.actionButtonText}>Start Attendance Session</Text>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { padding: 20, paddingBottom: 48 },
  screenTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 12,
  },

  // Class cards
  classCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  classCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  classCardContent: { flex: 1 },
  classCardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  classCardTitleSelected: { color: colors.primary },
  classCardMeta: { gap: 4 },
  classCardMeta_: { fontSize: 13, color: colors.textSecondary, marginLeft: 4, fontWeight: '500' },
  classCardMetaSelected: { color: colors.primaryDark },
  selectedCheckmark: { marginLeft: 12 },

  // QR view
  qrWrapper: { alignItems: 'center', marginBottom: 24 },
  qrCard: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 5,
    borderWidth: 1,
    borderColor: colors.border,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.danger,
    marginRight: 6,
  },
  liveText: { fontSize: 12, fontWeight: '800', color: colors.danger, letterSpacing: 0.8 },

  // Info section
  infoSection: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoLabel: { fontSize: 11, fontWeight: '700', color: colors.textSecondary, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 4 },
  infoTitle: { fontSize: 20, fontWeight: '800', color: colors.text, marginBottom: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  infoText: { fontSize: 14, color: colors.textSecondary, fontWeight: '500' },

  instructions: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },

  // Action button
  actionButton: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  actionButtonText: { color: '#fff', fontWeight: '700', fontSize: 17 },

  // Result screens
  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  resultIconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  resultTitle: { fontSize: 26, fontWeight: '800', color: colors.text, marginBottom: 8, textAlign: 'center' },
  resultSubtitle: { fontSize: 16, color: colors.textSecondary, marginBottom: 40, textAlign: 'center' },
});
