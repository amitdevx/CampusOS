import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';

type BadgeVariant = 'default' | 'primary' | 'success' | 'danger' | 'warning' | 'info' | 'student' | 'teacher' | 'faculty' | 'admin';

const variantMap: Record<BadgeVariant, { bg: string; text: string; border: string }> = {
  default:  { bg: '#F1F5F9', text: '#475569', border: '#E2E8F0' },
  primary:  { bg: colors.primaryLight, text: colors.primary, border: '#BFDBFE' },
  success:  { bg: colors.successLight, text: colors.success, border: '#BBF7D0' },
  danger:   { bg: colors.dangerLight, text: colors.danger, border: '#FECACA' },
  warning:  { bg: colors.warningLight, text: colors.warning, border: '#FDE68A' },
  info:     { bg: colors.infoLight, text: colors.info, border: '#A5F3FC' },
  student:  { bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE' },
  teacher:  { bg: '#F0FDFA', text: '#0D9488', border: '#99F6E4' },
  faculty:  { bg: '#F5F3FF', text: '#7C3AED', border: '#DDD6FE' },
  admin:    { bg: '#F1F5F9', text: '#1E293B', border: '#CBD5E1' },
};

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
}

export function Badge({ label, variant = 'default', style }: BadgeProps) {
  const { bg, text, border } = variantMap[variant];
  return (
    <View style={[styles.badge, { backgroundColor: bg, borderColor: border }, style]}>
      <Text style={[styles.text, { color: text }]}>{label.toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
});
