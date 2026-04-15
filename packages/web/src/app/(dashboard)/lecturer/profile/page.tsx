'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from '@/lib/supabase/session';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import DashboardLayout from '@/components/layout/dashboard-layout';
import Input from '@/components/ui/input';
import Button from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import { CameraIcon, UserIcon, EnvelopeIcon, PhoneIcon, AcademicCapIcon, IdentificationIcon } from '@heroicons/react/24/outline';
import { typedSupabase as supabase } from '@/lib/supabase/client';
import { FadeIn, ScrollReveal } from '@/components/ui';

interface ProfileFormData {
  full_name: string;
  phone: string;
  address: string;
  bio: string;
  avatar_url: string;
  employee_id: string;
  department: string;
  gender: string;
  date_of_birth: string;
}

export default function LecturerProfilePage() {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [form, setForm] = useState<ProfileFormData>({
    full_name: '',
    phone: '',
    address: '',
    bio: '',
    avatar_url: '',
    employee_id: '',
    department: '',
    gender: '',
    date_of_birth: ''
  });

  useEffect(() => {
    if (user) {
      setForm({
        full_name: user.full_name || '',
        phone: user.phone || '',
        address: (user as any).address || '',
        bio: (user as any).bio || '',
        avatar_url: user.avatar_url || '',
        employee_id: user.employee_id || '',
        department: (user as any).department || '',
        gender: (user as any).gender || '',
        date_of_birth: (user as any).date_of_birth || ''
      });
    }
  }, [user]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(`avatars/${fileName}`, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(`avatars/${fileName}`);
      setForm(prev => ({ ...prev, avatar_url: publicUrl }));
      toast.success('Photo updated!');
    } catch (error: any) {
      toast.error(error.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<ProfileFormData>) => {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return res.json();
    },
    onSuccess: (data: any) => {
      if (data.success) {
        toast.success('Profile updated!');
        setEditing(false);
        queryClient.invalidateQueries({ queryKey: ['session'] });
      } else {
        toast.error(data.error || 'Failed to update');
      }
    }
  });

  return (
    <DashboardLayout role="lecturer">
      <div className="max-w-4xl mx-auto space-y-6">
        <FadeIn direction="down" className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
            <p className="text-gray-600 mt-1">Manage your lecturer profile</p>
          </div>
          <Button variant={editing ? 'secondary' : 'primary'} onClick={() => setEditing(!editing)}>
            {editing ? 'Cancel' : 'Edit Profile'}
          </Button>
        </FadeIn>

        <ScrollReveal animation="fade">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-6">
              <div className="relative">
                {form.avatar_url ? (
                  <img src={form.avatar_url} alt="" className="h-24 w-24 rounded-full object-cover" />
                ) : (
                  <div className="h-24 w-24 rounded-full bg-purple-100 flex items-center justify-center">
                    <span className="text-2xl font-bold text-purple-700">{form.full_name?.charAt(0) || '?'}</span>
                  </div>
                )}
                <label className="absolute bottom-0 right-0 bg-purple-600 text-white p-2 rounded-full cursor-pointer hover:bg-purple-700 transition-colors">
                  <CameraIcon className="h-4 w-4" />
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={isUploading} />
                </label>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{user?.full_name}</h2>
                <p className="text-gray-500">{user?.email}</p>
                <span className="inline-block mt-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm capitalize">
                  {user?.role}
                </span>
              </div>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal animation="slide" direction="up" delay={0.1}>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <AcademicCapIcon className="h-5 w-5 mr-2" /> Professional Information
            </h3>
            {editing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Full Name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
                <Input label="Employee ID" value={form.employee_id} onChange={(e) => setForm({ ...form, employee_id: e.target.value })} />
                <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                <Input label="Department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
                <Input label="Gender" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} />
                <Input label="Date of Birth" type="date" value={form.date_of_birth} onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })} />
                <div className="md:col-span-2">
                  <Input label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" placeholder="Your professional bio..." />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div><span className="text-sm text-gray-500">Full Name</span><p className="font-medium text-gray-900">{user?.full_name}</p></div>
                <div><span className="text-sm text-gray-500">Employee ID</span><p className="font-medium text-gray-900">{user?.employee_id || 'Not set'}</p></div>
                <div><span className="text-sm text-gray-500">Email</span><p className="font-medium text-gray-900">{user?.email}</p></div>
                <div><span className="text-sm text-gray-500">Phone</span><p className="font-medium text-gray-900">{user?.phone || 'Not set'}</p></div>
                <div><span className="text-sm text-gray-500">Department</span><p className="font-medium text-gray-900">{(user as any)?.department || 'Not set'}</p></div>
                <div><span className="text-sm text-gray-500">Gender</span><p className="font-medium text-gray-900 capitalize">{(user as any)?.gender || 'Not set'}</p></div>
                <div><span className="text-sm text-gray-500">Date of Birth</span><p className="font-medium text-gray-900">{(user as any)?.date_of_birth || 'Not set'}</p></div>
                <div className="md:col-span-2"><span className="text-sm text-gray-500">Address</span><p className="font-medium text-gray-900">{(user as any)?.address || 'Not set'}</p></div>
                <div className="md:col-span-2"><span className="text-sm text-gray-500">Bio</span><p className="font-medium text-gray-900">{(user as any)?.bio || 'Not set'}</p></div>
              </div>
            )}
          </div>
        </ScrollReveal>

        {editing && (
          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={() => setEditing(false)}>Cancel</Button>
            <Button onClick={() => updateMutation.mutate(form)} isLoading={updateMutation.isPending}>Save Changes</Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
