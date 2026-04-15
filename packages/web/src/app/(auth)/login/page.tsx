'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { typedSupabase as supabase } from '@/lib/supabase/client';
import Button from '@/components/ui/button';
import { APP_NAME } from '@acadion/shared';
import { useTheme } from '@/contexts/ThemeContext';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const router = useRouter();
  const { settings, currentColors } = useTheme();
  const { playClick, playSuccess, playError } = useSoundEffects();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginMethod, setLoginMethod] = useState<'password' | 'magic'>('password');

  useEffect(() => {
    const checkSessionError = () => {
      const cookies = document.cookie.split(';');
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'auth_error') {
          document.cookie = 'auth_error=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
          if (value === 'session_expired') {
            toast.error('Session expired. Please sign in again.');
          }
          break;
        }
      }
    };
    checkSessionError();
  }, []);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    playClick();
    if (!email.trim() || !password) {
      playError();
      toast.error('Please enter both email and password');
      return;
    }
    setIsLoading(true);
    try {
      console.log('Logging in with:', email);
      
      const { error, data } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        console.error('Login error:', error);
        playError();
        toast.error(`Login failed: ${error.message}`);
        setIsLoading(false);
        return;
      }
      
      console.log('Login success, user:', data.user?.id);
      playSuccess();
      toast.success('Logged in successfully!');
      
      // Wait for session to confirm before redirect
      setTimeout(() => {
        router.push('/student/dashboard');
      }, 200);
    } catch (err: any) {
      console.error('Catch error:', err);
      playError();
      toast.error(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    playClick();
    if (!email.trim()) {
      playError();
      toast.error('Please enter your email');
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback?next=/student/dashboard`
        }
      });

      if (error) {
        console.error('Auth: Magic link error:', error);
        playError();
        toast.error(`Failed to send magic link: ${error.message}`);
      } else {
        playSuccess();
        toast.success('Check your email for the magic link!');
      }
    } catch (err: any) {
      console.error('Magic link error:', err);
      playError();
      toast.error(err.message || 'Failed to send magic link');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-blue-400/20 to-purple-500/20 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-tr from-emerald-400/20 to-cyan-500/20 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-r from-primary-500/10 to-secondary-500/10 blur-3xl" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full relative z-10"
      >
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-8">
          {/* Logo/Icon Section */}
          <div className="text-center mb-8">
            {/* Graduation Cap Icon */}
            <motion.div 
              className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4 shadow-lg"
              style={{ background: `linear-gradient(135deg, ${currentColors.primary}, ${currentColors.secondary})` }}
              initial={{ scale: 0.8, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            >
              <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3L1 9L5 11.18V17.18L12 21L19 17.18V11.18L21 10.09V17H23V9L12 3ZM18.82 9L12 12.72L5.18 9L12 5.28L18.82 9ZM17 15.99L12 18.72L7 15.99V12.27L12 15L17 12.27V15.99Z"/>
                <path d="M5 19V21H19V19H5Z" opacity="0.7"/>
              </svg>
            </motion.div>

            {settings?.logo_url ? (
              <Image
                src={settings.logo_url}
                alt={settings.institution_name || APP_NAME}
                width={180}
                height={60}
                className="mx-auto h-12 w-auto object-contain"
              />
            ) : (
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                {settings?.institution_name || APP_NAME}
              </h1>
            )}
            {settings?.motto && (
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 italic">
                {settings.motto}
              </p>
            )}
            <h2 className="mt-6 text-xl font-semibold text-gray-900 dark:text-white">
              Welcome Back
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Sign in to continue to your dashboard
            </p>
          </div>

          {/* Tabs */}
          <div className="flex rounded-xl bg-gray-100 dark:bg-gray-700 p-1 mb-6">
            <button
              type="button"
              onClick={() => { playClick(); setLoginMethod('password'); }}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
                loginMethod === 'password'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Password
            </button>
            <button
              type="button"
              onClick={() => { playClick(); setLoginMethod('magic'); }}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
                loginMethod === 'magic'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Magic Link
            </button>
          </div>

          {loginMethod === 'password' ? (
            <form onSubmit={handleEmailLogin} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="flex items-center justify-end">
                <Link href="/forgot-password" className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
                  Forgot password?
                </Link>
              </div>

              <Button type="submit" className="w-full" isLoading={isLoading} size="lg">
                Sign In
              </Button>
            </form>
          ) : (
            <form onSubmit={handleMagicLink} className="space-y-5">
              <div>
                <label htmlFor="email-magic" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Email address
                </label>
                <input
                  id="email-magic"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all"
                  required
                  disabled={isLoading}
                />
              </div>

              <Button type="submit" className="w-full" isLoading={isLoading} size="lg">
                Send Magic Link
              </Button>
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Don&apos;t have an account?{' '}
              <Link
                href="/register"
                className="font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
              >
                Sign up now
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
