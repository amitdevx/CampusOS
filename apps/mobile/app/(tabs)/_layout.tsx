import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: '#2563eb',
    }}>
      <Tabs.Screen
        name="home"
        options={{ title: 'Home', headerTitle: 'Dashboard' }}
      />
      <Tabs.Screen
        name="classes"
        options={{ title: 'Classes', headerTitle: 'Timetable' }}
      />
      <Tabs.Screen
        name="events"
        options={{ title: 'Events', headerTitle: 'Campus Events' }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profile', headerTitle: 'My Profile' }}
      />
    </Tabs>
  );
}
