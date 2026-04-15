'use client';

import React from 'react';
import Link from 'next/link';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 bg-gradient-to-br from-primary-50 to-blue-100">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-4xl font-bold text-primary-600">Acaedu</h1>
          </Link>
          <p className="mt-2 text-sm text-gray-600">
            Smart Academic Scheduling & Notifications
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {children}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} Acaedu. All rights reserved.</p>
          <div className="mt-2 space-x-4">
            <Link href="/privacy" className="hover:text-primary-600">
              Privacy Policy
            </Link>
            <Link href="/about" className="hover:text-primary-600">
              About
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
