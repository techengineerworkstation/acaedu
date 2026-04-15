'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { typedSupabase as supabase } from '@/lib/supabase/client';
import { toast } from 'react-hot-toast';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import { ROLES_ARRAY } from '@acadion/shared';

function CompleteProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('next') || '/student/dashboard';

  const [role, setRole] = useState<'student' | 'lecturer' | 'admin'>('student');
  const [studentId, setStudentId] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [department, setDepartment] = useState('');
  const [departments, setDepartments] = useState<Array<{ value: string; label: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchDepartments = async () => {
      const { data } = await supabase
        .from('departments')
        .select('id, name');
      if (data) {
        setDepartments(data.map((d: { id: string; name: string }) => ({ value: d.id, label: d.name })));
      }
    };
    fetchDepartments();
  }, []);

  const roleOptions = ROLES_ARRAY.map((r) => ({
    value: r,
    label: r.charAt(0).toUpperCase() + r.slice(1)
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast.error('No user logged in');
        router.push('/login');
        return;
      }

      const { error } = await supabase
        .from('users')
        .update({
          role,
          student_id: role === 'student' ? studentId : null,
          employee_id: role === 'lecturer' || role === 'admin' ? employeeId : null,
          department: department || null
        })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      toast.success('Profile completed!');
      router.push(redirectTo);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Complete Your Profile
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Please provide additional information to finish setting up your account.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                I am a:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {roleOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setRole(option.value as any)}
                    className={`p-3 text-sm font-medium rounded-lg border-2 transition-colors ${
                      role === option.value
                        ? 'border-primary-600 bg-primary-50 text-primary-700'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department
              </label>
              <Select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                options={departments}
              />
            </div>

            {(role === 'student') && (
              <Input
                label="Student ID"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                required
                placeholder="Enter your student ID"
              />
            )}

            {(role === 'lecturer' || role === 'admin') && (
              <Input
                label="Employee ID"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                required
                placeholder="Enter your employee ID"
              />
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            isLoading={isLoading}
          >
            Complete Profile
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function CompleteProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    }>
      <CompleteProfileContent />
    </Suspense>
  );
}
