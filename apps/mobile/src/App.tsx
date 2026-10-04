import React, { useEffect, useState, useCallback } from 'react';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Home, BookOpen, Calendar, Scan, User, MapPin } from 'lucide-react-native';
import * as SecureStore from "expo-secure-store";
import { setAuthToken, getMe, updatePushToken, setUnauthorizedCallback } from "@campusos/api-client";
import { usePushNotifications } from './hooks/usePushNotifications';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { colors } from './theme/colors';

import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import ClassesScreen from './screens/ClassesScreen';
import EventsScreen from './screens/EventsScreen';
import ScanScreen from './screens/ScanScreen';
import GenerateQRScreen from './screens/GenerateQRScreen';
import ProfileScreen from './screens/ProfileScreen';
import ResourcesScreen from './screens/ResourcesScreen';
import AdminHomeScreen from './screens/AdminHomeScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

export const navigationRef = createNavigationContainerRef<any>();

let isLoggingOut = false;

export async function logout(setAppState?: any, setInitialRoute?: any) {
  if (isLoggingOut) return;
  isLoggingOut = true;
  try {
    // Attempt to invalidate push token on the server so the device stops receiving notifications.
    // Wrap in try-catch so offline/failed requests do not block the local logout.
    await updatePushToken(null);
  } catch (error) {
    console.warn("Failed to invalidate push token on server during logout", error);
  }

  await SecureStore.deleteItemAsync('userToken');
  await SecureStore.deleteItemAsync('userRole');
  await SecureStore.deleteItemAsync('offline_user');
  await SecureStore.deleteItemAsync('offline_schedule');
  setAuthToken(null);
  if (navigationRef.isReady()) {
    navigationRef.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  } else if (setAppState && setInitialRoute) {
    setInitialRoute('Login');
    setAppState('READY');
  }
  isLoggingOut = false;
}

function StudentNavigator() {
  return (
    <Tab.Navigator screenOptions={tabOptions('#2563eb')}>
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
    <Tab.Navigator screenOptions={tabOptions('#0d9488')}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Classes" component={ClassesScreen} />
      <Tab.Screen name="Generate QR" component={GenerateQRScreen} />
      <Tab.Screen name="Events" component={EventsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function FacultyNavigator() {
  return (
    <Tab.Navigator screenOptions={tabOptions('#7c3aed')}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Classes" component={ClassesScreen} />
      <Tab.Screen name="Events" component={EventsScreen} />
      <Tab.Screen name="Resources" component={ResourcesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function AdminNavigator() {
  return (
    <Tab.Navigator screenOptions={tabOptions('#374151')}>
      <Tab.Screen name="Home" component={AdminHomeScreen} />
      <Tab.Screen name="Resources" component={ResourcesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function SuperAdminNavigator() {
  return (
    <Tab.Navigator screenOptions={tabOptions('#09090B')}>
      <Tab.Screen name="Home" component={AdminHomeScreen} />
      <Tab.Screen name="Resources" component={ResourcesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const tabOptions = (activeColor: string) => ({ route }: any) => ({
  headerShown: false,
  tabBarActiveTintColor: activeColor,
  tabBarInactiveTintColor: '#6b7280',
  tabBarIcon: ({ color, size }: any) => {
    if (route.name === 'Home') return <Home color={color} size={size} />;
    if (route.name === 'Classes') return <BookOpen color={color} size={size} />;
    if (route.name === 'Scan QR' || route.name === 'Generate QR') return <Scan color={color} size={size} />;
    if (route.name === 'Events') return <Calendar color={color} size={size} />;
    if (route.name === 'Resources') return <MapPin color={color} size={size} />;
    if (route.name === 'Profile') return <User color={color} size={size} />;
  },
});

function MainNavigator({ route }: any) {
  const role = route?.params?.role || 'STUDENT';
  if (role === 'TEACHER') return <TeacherNavigator />;
  if (role === 'FACULTY') return <FacultyNavigator />;
  if (role === 'ADMIN') return <AdminNavigator />;
  if (role === 'SUPER_ADMIN') return <SuperAdminNavigator />;
  return <StudentNavigator />;
}


export default function App() {
  const [appState, setAppState] = useState<'LOADING' | 'READY' | 'ERROR'>('LOADING');
  const [initialRoute, setInitialRoute] = useState<'Login' | 'Main'>('Login');
  const [initialRole, setInitialRole] = useState('STUDENT');
  const [errorMsg, setErrorMsg] = useState('');
  
  const { expoPushToken } = usePushNotifications();

  useEffect(() => {
    setUnauthorizedCallback(() => {
      logout(setAppState, setInitialRoute);
    });
  }, []);

  const restoreSession = useCallback(async () => {
    setAppState('LOADING');
    try {
      const token = await SecureStore.getItemAsync('userToken');
      const cachedRole = await SecureStore.getItemAsync('userRole');
      
      if (!token) {
        setInitialRoute('Login');
        setAppState('READY');
        return;
      }
      
      // We have a token. Immediately mount the app using cached role to avoid blocking on network!
      setAuthToken(token);
      setInitialRole(cachedRole || 'STUDENT');
      setInitialRoute('Main');
      setAppState('READY');
      
      // Now validate asynchronously in the background
      validateSessionBackground();
    } catch (e) {
      console.error("Session restore error", e);
      setInitialRoute('Login');
      setAppState('READY');
    }
  }, []);
  
  const validateSessionBackground = async () => {
    try {
      const user = await getMe();
      // If role changed, update cache. We don't force a reload to avoid jarring the user, 
      // but next launch will use the new role.
      await SecureStore.setItemAsync('userRole', user.role);
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        console.error("Background validation: Token invalid or expired. Forcing logout.");
        logout(setAppState, setInitialRoute);
      } else {
        console.log("Background validation: Server offline or waking up. Continuing with cached session.");
      }
    }
  };

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  useEffect(() => {
    if (appState === 'READY' && initialRoute === 'Main' && expoPushToken?.data) {
      updatePushToken(expoPushToken.data).catch(console.error);
    }
  }, [appState, initialRoute, expoPushToken]);

  if (appState === 'LOADING') {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#09090B" />
        <Text style={styles.loadingText}>Waking up server...</Text>
      </View>
    );
  }

  if (appState === 'ERROR') {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>Connection Failed</Text>
        <Text style={styles.errorText}>{errorMsg}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={restoreSession}>
          <Text style={styles.retryBtnText}>Retry Connection</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.retryBtn, {backgroundColor: 'transparent', borderWidth: 1, borderColor: '#E4E4E7', marginTop: 12}]} onPress={() => logout(setAppState, setInitialRoute)}>
          <Text style={[styles.retryBtnText, {color: '#09090B'}]}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Main" component={MainNavigator} initialParams={{ role: initialRole }} />
          <Stack.Screen name="Resources" component={ResourcesScreen} />
        </Stack.Navigator>
      </NavigationContainer>
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    color: '#71717A',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#09090B',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 15,
    color: '#71717A',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  retryBtn: {
    backgroundColor: '#09090B',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  }
});
