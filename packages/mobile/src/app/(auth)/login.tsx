import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { signInWithGoogle, signInWithApple } from '../../services/auth/firebase';
import { useAuthStore } from '../../stores';
import { Button, Input } from '../../components/ui';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { APP_NAME } from '../../constants';

export default function LoginScreen() {
  const router = useRouter();
  const { setUser, setSession } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { user, session } = await signInWithGoogle();
      setUser(user);
      setSession(session);

      // Navigate based on role
      switch (user.role) {
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
      setError(err.message || 'Google sign-in failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { user, session } = await signInWithApple();
      setUser(user);
      setSession(session);

      // Navigate based on role
      switch (user.role) {
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
      setError(err.message || 'Apple sign-in failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async () => {
    setError('Email/password login requires additional Firebase configuration. Please use Google or Apple.');
    // For full implementation, see Firebase docs for EmailAuthProvider
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
            <Text style={styles.tagline}>Smart Academic Scheduling</Text>
          </View>

          {/* Welcome */}
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeTitle}>Welcome back!</Text>
            <Text style={styles.welcomeSubtitle}>Sign in to continue</Text>
          </View>

          {/* Error */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Social buttons */}
          <View style={styles.socialContainer}>
            <Button
              title="Continue with Google"
              onPress={handleGoogleSignIn}
              variant="outline"
              fullWidth
              isLoading={isLoading}
              leftIcon={<Text style={styles.socialIcon}>G</Text>}
              style={styles.socialButton}
            />

            <Button
              title="Continue with Apple"
              onPress={handleAppleSignIn}
              variant="outline"
              fullWidth
              isLoading={isLoading}
              leftIcon={<Text style={styles.appleIcon}>🍎</Text>}
              style={styles.socialButton}
            />
          </View>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.divider} />
          </View>

          {/* Email form */}
          <View style={styles.formContainer}>
            <Input
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />

            <Input
              label="Password"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
            />

            <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')}>
              <Text style={styles.forgotPassword}>Forgot password?</Text>
            </TouchableOpacity>

            <Button
              title="Sign In"
              onPress={handleEmailLogin}
              fullWidth
              style={styles.signInButton}
            />
          </View>

          {/* Register link */}
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <Text style={styles.registerLink}>Sign up</Text>
            </TouchableOpacity>
          </View>
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
    marginBottom: SPACING['2xl']
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
  welcomeContainer: {
    marginBottom: SPACING.xl
  },
  welcomeTitle: {
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs
  },
  welcomeSubtitle: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.secondary
  },
  errorContainer: {
    backgroundColor: COLORS.error + '20',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.lg
  },
  errorText: {
    color: COLORS.error,
    textAlign: 'center'
  },
  socialContainer: {
    marginBottom: SPACING.lg
  },
  socialButton: {
    marginBottom: SPACING.sm
  },
  socialIcon: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.gray[700]
  },
  appleIcon: {
    fontSize: 20
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
    marginBottom: SPACING.xl
  },
  forgotPassword: {
    textAlign: 'right',
    color: COLORS.primary[600],
    fontSize: TYPOGRAPHY.sizes.sm,
    marginTop: SPACING.sm
  },
  signInButton: {
    marginTop: SPACING.md
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center'
  },
  registerText: {
    color: COLORS.text.secondary,
    fontSize: TYPOGRAPHY.sizes.base
  },
  registerLink: {
    color: COLORS.primary[600],
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.medium
  }
});
