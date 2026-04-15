import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { signInWithGoogle, signInWithApple } from '../../services/auth/firebase';
import { useAuthStore } from '../../stores';
import { Button, Input, Select } from '../../components/ui';
import { Alert } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, ROLES_ARRAY } from '../../constants/theme';
import { APP_NAME, ROLES, ROLE_LABELS } from '@acadion/shared';

export default function RegisterScreen() {
  const router = useRouter();
  const { setUser, setSession } = useAuthStore();

  const [role, setRole] = useState<typeof ROLES[keyof typeof ROLES]>(ROLES.STUDENT);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [department, setDepartment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const departments = [
    { label: 'Computer Science', value: 'cs' },
    { label: 'Mathematics', value: 'math' },
    { label: 'Physics', value: 'phys' },
    { label: 'Engineering', value: 'engr' },
    { label: 'Business', value: 'bus' },
    { label: 'Arts & Humanities', value: 'arts' }
  ];

  const roleOptions = ROLES_ARRAY.map(r => ({ label: ROLE_LABELS[r] || r, value: r }));

  const handleSocialSignUp = async (provider: 'google' | 'apple') => {
    setIsLoading(true);
    setError(null);

    try {
      const result = provider === 'google'
        ? await signInWithGoogle(role)
        : await signInWithApple(role);

      setUser(result.user);
      setSession(result.session);

      // Navigate based on role
      switch (result.user.role) {
        case 'student':
          router.replace('/(student)/dashboard');
          break;
        case 'lecturer':
          router.replace('/(lecturer)/dashboard');
          break;
        case 'admin':
          router.replace('/(admin)/dashboard');
          break;
        default:
          router.replace('/(student)/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Sign-up failed');
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>{APP_NAME}</Text>
            <Text style={styles.tagline}>Create your account</Text>
          </View>

          {/* Role Selection */}
          <Text style={styles.label}>I am a:</Text>
          <View style={styles.roleContainer}>
            {roleOptions.map(option => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.roleButton,
                  role === option.value && styles.roleButtonActive
                ]}
                onPress={() => setRole(option.value as any)}
              >
                <Text style={[
                  styles.roleButtonText,
                  role === option.value && styles.roleButtonTextActive
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Social sign up */}
          <View style={styles.socialContainer}>
            <Button
              title="Sign up with Google"
              onPress={() => handleSocialSignUp('google')}
              variant="outline"
              fullWidth
              isLoading={isLoading}
              style={styles.socialButton}
            />
            <Button
              title="Sign up with Apple"
              onPress={() => handleSocialSignUp('apple')}
              variant="outline"
              fullWidth
              isLoading={isLoading}
              style={styles.socialButton}
            />
          </View>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.divider} />
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <Input
              label="Full Name"
              placeholder="Enter your full name"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
            />

            <Input
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Input
              label="Password"
              placeholder="At least 8 characters"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <Input
              label="Confirm Password"
              placeholder="Re-enter password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              error={confirmPassword && password !== confirmPassword ? 'Passwords do not match' : undefined}
            />

            {(role === 'student' || role === 'lecturer') && (
              <Select
                label="Department"
                options={departments}
                value={department}
                onChange={setDepartment}
                placeholder="Select department"
              />
            )}

            <Button
              title="Create Account"
              onPress={() => {
                Alert.alert(
                  'Demo Mode',
                  'Please use Google or Apple sign-up for this demo. Email sign-up requires backend setup.',
                  [{ text: 'OK' }]
                );
              }}
              fullWidth
              style={styles.submitButton}
            />
          </View>

          {/* Already have account */}
          <TouchableOpacity
            style={styles.loginLinkContainer}
            onPress={() => router.replace('/(auth)/login')}
          >
            <Text style={styles.loginText}>Already have an account? Sign in</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  keyboardView: {
    flex: 1
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: SPACING.xl
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl
  },
  logoText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.primary[600],
    letterSpacing: -1
  },
  tagline: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.secondary,
    marginTop: SPACING.xs
  },
  label: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm
  },
  roleContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.lg,
    gap: SPACING.sm
  },
  roleButton: {
    flex: 1,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    backgroundColor: COLORS.surface
  },
  roleButtonActive: {
    backgroundColor: COLORS.primary[600],
    borderColor: COLORS.primary[600]
  },
  roleButtonText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.primary
  },
  roleButtonTextActive: {
    color: 'white',
    fontWeight: TYPOGRAPHY.weights.semibold
  },
  socialContainer: {
    marginBottom: SPACING.lg
  },
  socialButton: {
    marginBottom: SPACING.sm
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.lg
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border
  },
  dividerText: {
    marginHorizontal: SPACING.md,
    color: COLORS.gray[500],
    fontSize: TYPOGRAPHY.sizes.sm
  },
  formContainer: {
    marginBottom: SPACING.lg
  },
  errorContainer: {
    backgroundColor: COLORS.error + '20',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md
  },
  errorText: {
    color: COLORS.error,
    textAlign: 'center'
  },
  submitButton: {
    marginTop: SPACING.md
  },
  loginLinkContainer: {
    alignItems: 'center',
    marginTop: SPACING.md
  },
  loginLink: {
    color: COLORS.primary[600],
    fontSize: TYPOGRAPHY.sizes.base
  },
  loginText: {
    color: COLORS.text.secondary,
    fontSize: TYPOGRAPHY.sizes.base
  }
});
