import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Home, BookOpen, Calendar, Scan, User } from 'lucide-react-native';

import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import ClassesScreen from './screens/ClassesScreen';
import EventsScreen from './screens/EventsScreen';
import ScanScreen from './screens/ScanScreen';
import GenerateQRScreen from './screens/GenerateQRScreen';
import ProfileScreen from './screens/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function StudentNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#6b7280',
        tabBarIcon: ({ color, size }) => {
          if (route.name === 'Home') return <Home color={color} size={size} />;
          if (route.name === 'Classes') return <BookOpen color={color} size={size} />;
          if (route.name === 'Scan QR') return <Scan color={color} size={size} />;
          if (route.name === 'Events') return <Calendar color={color} size={size} />;
          if (route.name === 'Profile') return <User color={color} size={size} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Classes" component={ClassesScreen} />
      <Tab.Screen name="Scan QR" component={ScanScreen} />
      <Tab.Screen name="Events" component={EventsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function TeacherNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#0d9488',
        tabBarInactiveTintColor: '#6b7280',
        tabBarIcon: ({ color, size }) => {
          if (route.name === 'Home') return <Home color={color} size={size} />;
          if (route.name === 'Classes') return <BookOpen color={color} size={size} />;
          if (route.name === 'Generate QR') return <Scan color={color} size={size} />;
          if (route.name === 'Events') return <Calendar color={color} size={size} />;
          if (route.name === 'Profile') return <User color={color} size={size} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Classes" component={ClassesScreen} />
      <Tab.Screen name="Generate QR" component={GenerateQRScreen} />
      <Tab.Screen name="Events" component={EventsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function MainNavigator({ route }: any) {
  const role = route?.params?.role || 'STUDENT';

  if (role === 'TEACHER' || role === 'FACULTY' || role === 'ADMIN' || role === 'SUPER_ADMIN') {
    return <TeacherNavigator />;
  }
  
  return <StudentNavigator />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Main" component={MainNavigator} />
        </Stack.Navigator>
      </NavigationContainer>
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}
