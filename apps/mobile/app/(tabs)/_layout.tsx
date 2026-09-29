import { Tabs } from 'expo-router';
// Expo router provides basic icons or we can use FontAwesome/Ionicons
// Since this is a lightweight setup, we'll just use text labels for now if icons aren't installed

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: '#2563eb',
    }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          headerTitle: 'CampusOS',
        }}
      />
    </Tabs>
  );
}
