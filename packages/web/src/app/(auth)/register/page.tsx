'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { typedSupabase as supabase } from '@/lib/supabase/client';
import Button from '@/components/ui/button';
import { ROLES, ROLES_ARRAY, APP_NAME } from '@acadion/shared';
import { useTheme } from '@/contexts/ThemeContext';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface Department {
  id: string;
  name: string;
  code: string;
}

// Admin emails that can register as admin
const ADMIN_EMAILS = ['ChidexIbe@gmx.com', 'DanielEbirim20@gmail.com'];

// All other emails register as students
export default function RegisterPage() {
  const router = useRouter();
  const { settings, currentColors } = useTheme();
  const { playClick, playSuccess, playError } = useSoundEffects();
  const [role, setRole] = useState<typeof ROLES[keyof typeof ROLES]>(ROLES.STUDENT);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedYear, setSelectedYear] = useState('1');
  const [selectedSemester, setSelectedSemester] = useState('1');

  // Auto-set role based on email
  useEffect(() => {
    if (ADMIN_EMAILS.includes(email.toLowerCase())) {
      setRole(ROLES.ADMIN);
    } else if (email && !ADMIN_EMAILS.includes(email.toLowerCase())) {
      setRole(ROLES.STUDENT);
    }
  }, [email]);

  useEffect(() => {
    if (role === ROLES.STUDENT) {
      fetchDepartments();
    }
  }, [role]);

  const fetchDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('id, name, code')
        .order('name');
      
      if (error) throw error;
      setDepartments(data || []);
    } catch (error) {
      console.error('Failed to fetch departments:', error);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    playClick();
    if (!email.trim() || !password) {
      playError();
      toast.error('Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      playError();
      toast.error('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      playError();
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (role === ROLES.STUDENT && !selectedDepartment) {
      playError();
      toast.error('Please select a department');
      return;
    }
    setIsLoading(true);
    try {
      const { error, data } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`,
          data: { 
            role: role,
            department_id: role === ROLES.STUDENT ? selectedDepartment : null,
            year: role === ROLES.STUDENT ? parseInt(selectedYear) : null,
            semester: role === ROLES.STUDENT ? parseInt(selectedSemester) : null
          }
        }
      });

      if (error) {
        playError();
        toast.error(`Failed to create account: ${error.message}`);
      } else {
        playSuccess();
        if (data.session) {
          // Auto-create user in users table
          const user = data.user;
          if (user) {
            await supabase.from('users').insert({
              id: user.id,
              email: user.email,
              full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
              role: role,
              email_verified: true,
              department: role === ROLES.STUDENT ? selectedDepartment : null,
            });
          }
          
          const roleRoutes: Record<string, string> = {
            student: '/student/dashboard',
            lecturer: '/lecturer/dashboard',
            admin: '/admin/dashboard',
          };
          
          toast.success('Account created! Redirecting...');
          setTimeout(() => {
            window.location.href = roleRoutes[role] || '/';
          }, 500);
        } else {
          toast.success('Account created! Please check your email to confirm your account.');
        }
      }
    } catch (err: any) {
      playError();
      toast.error(err.message || 'Failed to create account');
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
          emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback?next=/student/dashboard`,
          data: { 
            role: role,
            full_name: email.split('@')[0],
            department_id: role === ROLES.STUDENT ? selectedDepartment : null,
            year: role === ROLES.STUDENT ? parseInt(selectedYear) : null,
            semester: role === ROLES.STUDENT ? parseInt(selectedSemester) : null
          }
        }
      });

      if (error) {
        playError();
        toast.error(`Failed to send magic link: ${error.message}`);
      } else {
        playSuccess();
        toast.success('Check your email for the magic link!');
      }
    } catch (err: any) {
      playError();
      toast.error(err.message || 'Failed to send magic link');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/10 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-br from-blue-400/20 to-purple-500/20 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-tr from-emerald-400/20 to-cyan-500/20 blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/3 right-1/4 w-60 h-60 rounded-full bg-gradient-to-l from-amber-400/15 to-orange-500/15 blur-3xl animate-pulse" style={{ animationDelay: '0.75s' }} />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full relative z-10"
      >
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-8">
          {/* Header with Graduation Icon */}
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
              Create Your Account
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Join the academic community today
            </p>
          </div>

          {/* Role Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              I am a:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {roleOptions.map((option) => {
                const icons: Record<string, JSX.Element> = {
                  student: <svg className="w-4 h-4 mx-auto mb-1" fill="currentColor" viewBox="0 0 20 20"><path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"/></svg>,
                  lecturer: <svg className="w-4 h-4 mx-auto mb-1" fill="currentColor" viewBox="0 0 20 20"><path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.36v8.128a1 1 0 001.555.832l3-1.426A1 1 0 0010 16.18V10.36l1.69.927a1 1 0 001.55-.832l-7-3.14a1 1 0 00-1.55.832l-1.69 1.14v-1.14z"/></svg>,
                  admin: <svg className="w-4 h-4 mx-auto mb-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                };
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => { playClick(); setRole(option.value as typeof ROLES[keyof typeof ROLES]); }}
                    className={`p-3 text-xs font-medium rounded-xl border-2 transition-all flex flex-col items-center hover:scale-102 active:scale-98 ${
                      role === option.value
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                        : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    {icons[option.value]}
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Student Registration Details */}
          {role === ROLES.STUDENT && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl border border-primary-200 dark:border-primary-800"
            >
              <h3 className="text-sm font-semibold text-primary-700 dark:text-primary-300 mb-3">
                Academic Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label htmlFor="department" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Department
                  </label>
                  <select
                    id="department"
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
                    required
                    disabled={isLoading}
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name} ({dept.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="year" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Year
                  </label>
                  <select
                    id="year"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
                    required
                    disabled={isLoading}
                  >
                    <option value="1">Year 1</option>
                    <option value="2">Year 2</option>
                    <option value="3">Year 3</option>
                    <option value="4">Year 4</option>
                    <option value="5">Year 5</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="semester" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Semester
                  </label>
                  <select
                    id="semester"
                    value={selectedSemester}
                    onChange={(e) => setSelectedSemester(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
                    required
                    disabled={isLoading}
                  >
                    <option value="1">Semester 1</option>
                    <option value="2">Semester 2</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}

          {/* Sign Up Form */}
          <form onSubmit={handleEmailSignUp} className="space-y-4">
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 chars"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all"
                  required
                  minLength={6}
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Confirm
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <Button type="submit" className="w-full" isLoading={isLoading} size="lg">
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

const roleOptions = ROLES_ARRAY.map((r) => ({
  value: r,
  label: r.charAt(0).toUpperCase() + r.slice(1)
}));
