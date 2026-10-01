import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';

interface EmptyStateProps {
  title: string;
  description?: string;
  style?: ViewStyle;
}

export function EmptyState({ title, description, style }: EmptyStateProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconBox}>
        <View style={styles.iconInner} />
        <View style={styles.iconLine} />
        <View style={[styles.iconLine, { width: 24, marginTop: 4 }]} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
    </View>
  );
}

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  style?: ViewStyle;
}

export function ErrorState({ message = 'Something went wrong.', onRetry, style }: ErrorStateProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={[styles.iconBox, { backgroundColor: '#FEF2F2' }]}>
        <Text style={{ fontSize: 24, color: colors.danger }}>!</Text>
      </View>
      <Text style={[styles.title, { color: colors.danger }]}>Load failed</Text>
      <Text style={styles.description}>{message}</Text>
    </View>
  );
}

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({ width = '100%', height = 16, borderRadius = 8, style }: SkeletonProps) {
  return (
    <View
      style={[
        styles.skeleton,
        { width: width as any, height, borderRadius },
        style,
      ]}
    />
  );
}

export function SkeletonCard() {
  return (
    <View style={styles.skeletonCard}>
      <Skeleton height={20} width="60%" style={{ marginBottom: 10 }} />
      <Skeleton height={14} width="40%" style={{ marginBottom: 8 }} />
      <Skeleton height={14} width="50%" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  iconInner: {
    width: 28,
    height: 20,
    backgroundColor: '#CBD5E1',
    borderRadius: 4,
  },
  iconLine: {
    width: 32,
    height: 3,
    backgroundColor: '#CBD5E1',
    borderRadius: 2,
    marginTop: 6,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  skeleton: {
    backgroundColor: '#E2E8F0',
  },
  skeletonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
});
