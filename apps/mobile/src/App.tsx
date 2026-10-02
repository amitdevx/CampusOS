import React, { useEffect, useState } from 'react';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Home, BookOpen, Calendar, Scan, User, MapPin } from 'lucide-react-native';
import * as SecureStore from "expo-secure-store";
import { setAuthToken, getMe, updatePushToken } from "@campusos/api-client";
import { usePushNotifications } from './hooks/usePushNotifications';

import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import ClassesScreen from './screens/ClassesScreen';
import EventsScreen from './screens/EventsScreen';
import ScanScreen from './screens/ScanScreen';
import GenerateQRScreen from './screens/GenerateQRScreen';
import ProfileScreen from './screens/ProfileScreen';
import ResourcesScreen from './screens/ResourcesScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

export const navigationRef = createNavigationContainerRef<any>();

export async function logout() {
  await SecureStore.deleteItemAsync('userToken');
  await SecureStore.deleteItemAsync('userRole');
  setAuthToken(null);
  if (navigationRef.isReady()) {
    navigationRef.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  }
}

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
          if (route.name === 'Resources') return <MapPin color={color} size={size} />;
          if (route.name === 'Profile') return <User color={color} size={size} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Classes" component={ClassesScreen} />
      <Tab.Screen name="Scan QR" component={ScanScreen} />
      <Tab.Screen name="Events" component={EventsScreen} />
      <Tab.Screen name="Resources" component={ResourcesScreen} />
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
          if (route.name === 'Resources') return <MapPin color={color} size={size} />;
          if (route.name === 'Profile') return <User color={color} size={size} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Classes" component={ClassesScreen} />
      <Tab.Screen name="Generate QR" component={GenerateQRScreen} />
      <Tab.Screen name="Events" component={EventsScreen} />
      <Tab.Screen name="Resources" component={ResourcesScreen} />
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
          if (route.name === 'Resources') return <MapPin color={color} size={size} />;
          if (route.name === 'Profile') return <User color={color} size={size} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Classes" component={ClassesScreen} />
      <Tab.Screen name="Events" component={EventsScreen} />
      <Tab.Screen name="Resources" component={ResourcesScreen} />
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

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [initialRoute, setInitialRoute] = useState<'Login' | 'Main'>('Login');
  const [initialRole, setInitialRole] = useState('STUDENT');
  
  const { expoPushToken } = usePushNotifications();

  useEffect(() => {
    async function restoreSession() {
      try {
        const token = await SecureStore.getItemAsync('userToken');
        
        if (token) {
          setAuthToken(token);
          try {
            const user = await getMe();
            await SecureStore.setItemAsync('userRole', user.role);
            setInitialRole(user.role);
            setInitialRoute('Main');
          } catch (err: any) {
            console.error("Token validation failed on launch", err);
            await SecureStore.deleteItemAsync('userToken');
            await SecureStore.deleteItemAsync('userRole');
            setAuthToken(null);
            setInitialRoute('Login');
          }
        }
      } catch (e) {
        console.error("Session restore error", e);
      } finally {
        setIsReady(true);
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
    return null; 
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Main" component={MainNavigator} initialParams={{ role: initialRole }} />
        </Stack.Navigator>
      </NavigationContainer>
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}
