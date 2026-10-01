import { setAuthToken, getMe } from "@campusos/api-client";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from 'react';
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

function StaffNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#7c3aed',
        tabBarInactiveTintColor: '#6b7280',
        tabBarIcon: ({ color, size }) => {
          if (route.name === 'Home') return <Home color={color} size={size} />;
          if (route.name === 'Classes') return <BookOpen color={color} size={size} />;
          if (route.name === 'Events') return <Calendar color={color} size={size} />;
          if (route.name === 'Profile') return <User color={color} size={size} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Classes" component={ClassesScreen} />
      <Tab.Screen name="Events" component={EventsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function MainNavigator({ route }: any) {
  const role = route?.params?.role || 'STUDENT';

  if (role === 'TEACHER') {
    return <TeacherNavigator />;
  } else if (role === 'FACULTY' || role === 'ADMIN' || role === 'SUPER_ADMIN') {
    return <StaffNavigator />;
  }
  
  return <StudentNavigator />;
}


import { usePushNotifications } from './hooks/usePushNotifications';
import { updatePushToken } from '@campusos/api-client';

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [initialRoute, setInitialRoute] = useState<'Login' | 'Main'>('Login');
  const [initialRole, setInitialRole] = useState('STUDENT');
  
  const { expoPushToken } = usePushNotifications();

  useEffect(() => {
    async function restoreSession() {
      try {
        const token = await SecureStore.getItemAsync('userToken');
        const cachedRole = await SecureStore.getItemAsync('userRole');
        
        if (token && cachedRole) {
          // Restore local session IMMEDIATELY. Don't block on network.
          setAuthToken(token);
          setInitialRole(cachedRole);
          setInitialRoute('Main');
          
          // Trigger a non-blocking background validation
          validateSessionInBackground();
        }
      } catch (e) {
        console.error("Session restore error", e);
      } finally {
        setIsReady(true);
      }
    }
    
    async function validateSessionInBackground() {
      try {
        const user = await getMe();
        // If successful, update the cached role just in case it changed
        await SecureStore.setItemAsync('userRole', user.role);
        setInitialRole(user.role);
      } catch (err: any) {
        const status = err?.response?.status;
        // ONLY log out if it's a definitive auth failure (401/403). 
        // 5xx or timeouts (like Render sleep) should KEEP the session.
        if (status === 401 || status === 403) {
          await SecureStore.deleteItemAsync('userToken');
          await SecureStore.deleteItemAsync('userRole');
          setAuthToken(null);
          // Normally we'd force navigation to Login here via a ref or context
        }
      }
    }

    restoreSession();
  }, []);

  useEffect(() => {
    if (initialRoute === 'Main' && expoPushToken?.data) {
      updatePushToken(expoPushToken.data).catch(console.error);
    }
  }, [initialRoute, expoPushToken]);

  if (!isReady) {
    return null; // Very brief, only blocks for SecureStore read (ms)
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Main" component={MainNavigator} initialParams={{ role: initialRole }} />
        </Stack.Navigator>
      </NavigationContainer>
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}
