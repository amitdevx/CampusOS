import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, SafeAreaView } from 'react-native';
import { Screen } from '../components/Screen';
import { getMySchedule } from '@campusos/api-client';
import { Clock, MapPin } from 'lucide-react-native';
import { colors } from '../theme/colors';

export default function ClassesScreen() {
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const data = await getMySchedule();
        setClasses(data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Screen style={styles.container}>
      <Text style={styles.header}>My Classes</Text>
      {classes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.empty}>No classes found in your schedule.</Text>
        </View>
      ) : (
        <FlatList
          contentContainerStyle={styles.listContent}
          data={classes}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.sessionRow}>
              <View style={styles.sessionTimeCol}>
                <Text style={styles.timeText}>
                  {new Date(item.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
                <Text style={[styles.timeText, { fontSize: 11, color: colors.textSecondary, fontWeight: '500' }]}>
                  {new Date(item.start_time).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                </Text>
              </View>
              <View style={styles.sessionCard}>
                <Text numberOfLines={1} ellipsizeMode="tail" style={styles.sessionSubject}>
                  {item.subject_name || "Unknown Subject"}
                  {item.subject_code ? ` (${item.subject_code})` : ''}
                </Text>
                <View style={styles.sessionDetailsRow}>
                  <View style={styles.detailItem}>
                    <Clock size={12} color={colors.textSecondary} style={styles.detailIcon} />
                    <Text style={styles.sessionDetail}>
                      {new Date(item.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <MapPin size={12} color={colors.textSecondary} style={styles.detailIcon} />
                    <Text style={styles.sessionDetail}>Room {item.room}</Text>
                  </View>
                </View>
                {(item.division_name || item.division_id) && (
                  <Text style={{ fontSize: 11, color: colors.textSecondary, marginTop: 6, fontWeight: '600' }}>
                    Division: {item.division_name || `DIV-${item.division_id}`}
                  </Text>
                )}
              </View>
            </View>
          )}

        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { fontSize: 28, fontWeight: '800', color: colors.text, marginHorizontal: 20, marginVertical: 20 },
  listContent: { paddingHorizontal: 20, paddingBottom: 40 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { color: colors.textSecondary, fontSize: 16 },
  sessionRow: { 
    flexDirection: 'row', 
    alignItems: 'stretch',
    marginBottom: 16,
  },
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
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
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
});
