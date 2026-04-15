import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Button, Input } from '../../components/ui';
import { COLORS, TYPOGRAPHY, SPACING } from '../../constants/theme';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 1500);
  };

  if (isSubmitted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.checkIcon}>✓</Text>
          <Text style={styles.title}>Check Your Email</Text>
          <Text style={styles.message}>
            We&apos;ve sent a password reset link to <Text style={styles.email}>{email}</Text>
          </Text>
          <Button
            title="Back to Sign In"
            onPress={() => router.replace('/(auth)/login')}
            style={styles.button}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>
          Enter your email address and we&apos;ll send you a reset link
        </Text>

        <View style={styles.form}>
          <Input
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Button
            title="Send Reset Link"
            onPress={handleSubmit}
            fullWidth
            isLoading={isLoading}
            style={styles.submitButton}
          />
        </View>

        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backLink}>Back to Sign In</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  content: {
    flex: 1,
    padding: SPACING.xl,
    justifyContent: 'center'
  },
  checkIcon: {
    fontSize: 64,
    color: COLORS.success,
    textAlign: 'center',
    marginBottom: SPACING.lg
  },
  title: {
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: SPACING.sm
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: TYPOGRAPHY.lineHeights.relaxed
  },
  message: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: TYPOGRAPHY.lineHeights.relaxed
  },
  email: {
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.text.primary
  },
  form: {
    marginBottom: SPACING.xl
  },
  submitButton: {
    marginTop: SPACING.md
  },
  backLink: {
    color: COLORS.primary[600],
    fontSize: TYPOGRAPHY.sizes.base,
    textAlign: 'center'
  }
});
