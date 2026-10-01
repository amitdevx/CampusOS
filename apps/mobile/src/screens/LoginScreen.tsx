import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { login, setAuthToken, getMe } from '@campusos/api-client';
import { Screen } from '../components/Screen';
import { colors } from '../theme/colors';

const ROLES = [
  { id: 'STUDENT', label: 'Student', email: 'student@gmail.com' },
  { id: 'TEACHER', label: 'Teacher', email: 'teacher@campusos.com' },
  { id: 'FACULTY', label: 'Faculty', email: 'faculty@campusos.com' },
  { id: 'ADMIN', label: 'Admin', email: 'superadmin@campusos.com' },
];

interface Props {
  navigation: any;
}

export default function LoginScreen({ navigation }: Props) {
  const [activeTab, setActiveTab] = useState(ROLES[0]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTabChange = (role: typeof ROLES[0]) => {
    setActiveTab(role);
    setEmail(''); // Clear for user to see placeholder
    setPassword('');
    setError('');
  };

  const handleLogin = async () => {
    const targetEmail = email.trim() || activeTab.email;
    if (!targetEmail || !password) {
      setError('Password is required.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await login(targetEmail.toLowerCase(), password);
      await SecureStore.setItemAsync('userToken', data.access_token);
      setAuthToken(data.access_token);
      
      const user = await getMe();
      await SecureStore.setItemAsync('userRole', user.role);

      navigation.replace('Main', { role: user.role });
    } catch (err: any) {
      const message =
        err?.response?.data?.detail || 'Invalid email or password.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.inner}>
          <View style={styles.headerContainer}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>R</Text>
            </View>
            <Text style={styles.title}>System Login</Text>
            <Text style={styles.subtitle}>{activeTab.label} Portal</Text>
          </View>

          <View style={styles.formContainer}>
            
            {/* ROLE TABS */}
            <View style={styles.tabContainer}>
              {ROLES.map((role) => (
                <TouchableOpacity
                  key={role.id}
                  onPress={() => handleTabChange(role)}
                  activeOpacity={0.7}
                  style={[
                    styles.tabButton,
                    activeTab.id === role.id && styles.tabButtonActive
                  ]}
                >
                  <Text style={[
                    styles.tabText,
                    activeTab.id === role.id && styles.tabTextActive
                  ]}>{role.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <Text style={styles.label}>EMAIL ADDRESS</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder={activeTab.email}
              placeholderTextColor={colors.textMuted}
            />

            <Text style={styles.label}>PASSWORD</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="••••••••"
              placeholderTextColor={colors.textMuted}
            />

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color={colors.surface} />
              ) : (
                <Text style={styles.buttonText}>AUTHENTICATE</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  logoText: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.surface,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.primary,
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  formContainer: {
    backgroundColor: colors.surface,
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 24,
    elevation: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    padding: 4,
    borderRadius: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  tabButtonActive: {
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  tabTextActive: {
    color: colors.primary,
  },
  label: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textSecondary,
    marginBottom: 8,
    letterSpacing: 1.5,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    fontSize: 15,
    color: colors.text,
  },
  button: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.8,
    backgroundColor: colors.primaryLight,
  },
  buttonText: {
    color: colors.surface,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  errorBox: {
    backgroundColor: colors.dangerLight,
    borderWidth: 1,
    borderColor: '#fecaca',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorText: {
    color: colors.danger,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '600',
  },
});
