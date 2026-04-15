'use client';

import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to Acaedu</h1>
        <p className="mb-8 text-gray-600 dark:text-gray-400">Smart Academic Scheduling System</p>
        <div className="space-x-4">
          <Link href="/login" className="px-6 py-3 bg-blue-600 text-white rounded-lg">
            Login
          </Link>
          <Link href="/register" className="px-6 py-3 border border-gray-300 rounded-lg">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}