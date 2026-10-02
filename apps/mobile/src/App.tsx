import React, { useEffect, useState, useCallback } from 'react';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Home, BookOpen, Calendar, Scan, User, MapPin } from 'lucide-react-native';
import * as SecureStore from "expo-secure-store";
import { setAuthToken, getMe, updatePushToken } from "@campusos/api-client";
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
    <Tab.Navigator screenOptions={tabOptions('#2563eb')}>
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
    <Tab.Navigator screenOptions={tabOptions('#0d9488')}>
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
    <Tab.Navigator screenOptions={tabOptions('#7c3aed')}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Classes" component={ClassesScreen} />
      <Tab.Screen name="Events" component={EventsScreen} />
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
  if (role === 'FACULTY' || role === 'ADMIN' || role === 'SUPER_ADMIN') return <StaffNavigator />;
  return <StudentNavigator />;
}

export default function App() {
  const [appState, setAppState] = useState<'LOADING' | 'READY' | 'ERROR'>('LOADING');
  const [initialRoute, setInitialRoute] = useState<'Login' | 'Main'>('Login');
  const [initialRole, setInitialRole] = useState('STUDENT');
  const [errorMsg, setErrorMsg] = useState('');
  
  const { expoPushToken } = usePushNotifications();

  const restoreSession = useCallback(async () => {
    setAppState('LOADING');
    try {
      const token = await SecureStore.getItemAsync('userToken');
      if (!token) {
        setInitialRoute('Login');
        setAppState('READY');
        return;
      }
      
      setAuthToken(token);
      
      try {
        const user = await getMe();
        await SecureStore.setItemAsync('userRole', user.role);
        setInitialRole(user.role);
        setInitialRoute('Main');
        setAppState('READY');
      } catch (err: any) {
        console.error("Token validation failed on launch", err);
        // If 401 or 403, token is dead. Delete it.
        if (err.response?.status === 401 || err.response?.status === 403) {
          await SecureStore.deleteItemAsync('userToken');
          await SecureStore.deleteItemAsync('userRole');
          setAuthToken(null);
          setInitialRoute('Login');
          setAppState('READY');
        } else {
          // It's a network error or server asleep
          setErrorMsg('Cannot connect to the ResoSync server. It might be waking up or offline.');
          setAppState('ERROR');
        }
      }
    } catch (e) {
      console.error("Session restore error", e);
      setAppState('READY');
    }
  }, []);

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
        <TouchableOpacity style={[styles.retryBtn, {backgroundColor: 'transparent', borderWidth: 1, borderColor: '#E4E4E7', marginTop: 12}]} onPress={logout}>
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
