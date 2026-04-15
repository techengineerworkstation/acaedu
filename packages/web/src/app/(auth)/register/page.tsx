'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { typedSupabase as supabase } from '@/lib/supabase/client';
import Button from '@/components/ui/button';
import { APP_NAME } from '@acadion/shared';
import { useTheme } from '@/contexts/ThemeContext';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface Department {
  id: string;
  name: string;
  code: string;
}

const ADMIN_EMAILS = ['ChidexIbe@gmx.com', 'DanielEbirim20@gmail.com'];

function useSoundEffectsSafe() {
  const playClick = useCallback(() => {}, []);
  const playSuccess = useCallback(() => {}, []);
  const playError = useCallback(() => {}, []);
  return { playClick, playSuccess, playError };
}

export default function RegisterPage() {
  const router = useRouter();
  const { settings, currentColors } = useTheme();
  const { playClick, playSuccess, playError } = useSoundEffectsSafe();
  const [role, setRole] = useState<'student' | 'lecturer' | 'admin'>('student');
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedYear, setSelectedYear] = useState('1');
  const [selectedSemester, setSelectedSemester] = useState('1');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="animate-pulse rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  useEffect(() => {
    if (ADMIN_EMAILS.includes(email.toLowerCase())) {
      setRole('admin');
    } else if (email) {
      setRole('student');
    }
  }, [email]);

  useEffect(() => {
    if (isMounted && role === 'student') {
      fetchDepartments();
    }
  }, [isMounted, role]);

  const fetchDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('id, name, code')
        .order('name');
      
      if (error) {
        console.log('Departments fetch error (expected if table missing)');
        return;
      }
      setDepartments(data || []);
    } catch (error) {
      console.log('Departments fetch error:', error);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    playClick();
    if (!email.trim() || !password) {
      playError();
      toast.error('Please enter email and password');
      return;
    }
    if (password.length < 6) {
      playError();
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      playError();
      toast.error('Passwords do not match');
      return;
    }
    setIsLoading(true);
    try {
      const fullName = email.split('@')[0];
      
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName,
            role: role,
            department_id: selectedDepartment || null,
            year: selectedYear,
            semester: selectedSemester
          }
        }
      });

      if (error) {
        console.error('Signup error:', error);
        playError();
        toast.error(error.message);
        setIsLoading(false);
        return;
      }

      if (data.user) {
        console.log('User registered:', data.user.id);
        playSuccess();
        toast.success('Registration successful! Please check your email to verify.');
        router.push('/login');
      }
    } catch (err: any) {
      console.error('Signup catch:', err);
      playError();
      toast.error(err.message || 'Registration failed');
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
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        playError();
        toast.error(error.message);
      } else {
        playSuccess();
        toast.success('Magic link sent! Check your email.');
      }
    } catch (err: any) {
      playError();
      toast.error(err.message || 'Failed to send magic link');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-blue-400/20 to-purple-500/20 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-tr from-emerald-400/20 to-cyan-500/20 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full relative z-10"
      >
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-8">
          <div className="text-center mb-8">
            <motion.div 
              className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4 shadow-lg"
              style={{ background: `linear-gradient(135deg, ${currentColors.primary}, ${currentColors.secondary})` }}
              initial={{ scale: 0.8, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            >
              <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3L1 9L5 11.18V17.18L12 21L19 17.18V11.18L21 10.09V17H23V9L12 3ZM18.82 9L12 12.72L5.18 9L12 5.28L18.82 9ZM17 15.99L12 18.72L7 15.99V12.27L12 15L17 12.27V15.99Z"/>
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

            <h2 className="mt-6 text-xl font-semibold text-gray-900 dark:text-white">
              Create Account
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Sign up to get started
            </p>
          </div>

          <form onSubmit={handleEmailSignUp} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 block w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>

            {role === 'student' && (
              <>
                <div>
                  <label htmlFor="department" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Department
                  </label>
                  <select
                    id="department"
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="mt-1 block w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name} ({dept.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="year" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Year
                    </label>
                    <select
                      id="year"
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                      className="mt-1 block w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      {[1,2,3,4,5].map((y) => (
                        <option key={y} value={y}>Year {y}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="semester" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Semester
                    </label>
                    <select
                      id="semester"
                      value={selectedSemester}
                      onChange={(e) => setSelectedSemester(e.target.value)}
                      className="mt-1 block w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      {[1,2].map((s) => (
                        <option key={s} value={s}>Semester {s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            )}

            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full"
            >
              Create Account
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  Or
                </span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={handleMagicLink}
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Send Magic Link
              </button>
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
              Sign in
            </Link>
          </p>
        </div>

        <p className="mt-4 text-center text-xs text-gray-400">
          &copy; {new Date().getFullYear()} Acaedu. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
}