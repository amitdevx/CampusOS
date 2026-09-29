import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { setAuthToken } from '@campusos/api-client';

export default function Index() {
  const [isReady, setIsReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const token = await SecureStore.getItemAsync('userToken');
        if (token) {
          // Put token in the API client
          setAuthToken(token);
          setIsAuthenticated(true);
        }
      } catch (e) {
        console.error("Failed to read token:", e);
      } finally {
        setIsReady(true);
      }
    }
    checkAuth();
  }, []);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return isAuthenticated ? <Redirect href="/(tabs)/home" /> : <Redirect href="/(auth)/login" />;
}
