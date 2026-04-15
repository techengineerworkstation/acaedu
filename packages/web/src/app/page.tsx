'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/supabase/session';

export default function RootPage() {
  const { user } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      // Redirect logged-in users to their dashboard
      const rolePath = {
        student: '/student/dashboard',
        lecturer: '/lecturer/dashboard',
        admin: '/admin/dashboard',
        dean: '/admin/dashboard'
      }[user.role];

      if (rolePath) {
        router.push(rolePath);
      }
    } else {
      // Redirect non-logged-in users to landing page
      router.push('/landing');
    }
  }, [user, router]);

  return null; // This component doesn't render anything, just redirects
}
