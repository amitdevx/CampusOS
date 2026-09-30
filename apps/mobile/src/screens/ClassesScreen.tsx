import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, SafeAreaView } from 'react-native';
import { getMySchedule } from '@campusos/api-client';
import { Card, CardContent } from '../components/Card';
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
    <SafeAreaView style={styles.container}>
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
            <Card style={styles.mb12}>
              <CardContent>
                <Text style={styles.title}>Subject #{item.subject_id}</Text>
                <Text style={styles.room}>Room: {item.room}</Text>
                <Text style={styles.time}>
                  {new Date(item.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                  {new Date(item.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </CardContent>
            </Card>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { fontSize: 24, fontWeight: '700', color: colors.text, marginHorizontal: 20, marginVertical: 16 },
  listContent: { paddingHorizontal: 20 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { color: colors.textSecondary, fontSize: 16 },
  mb12: { marginBottom: 12 },
  title: { fontSize: 18, fontWeight: '600', color: colors.text },
  room: { fontSize: 14, color: colors.textSecondary, marginTop: 4 },
  time: { fontSize: 14, color: colors.primary, marginTop: 8, fontWeight: '500' },
});
