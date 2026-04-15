'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '@/components/layout/dashboard-layout';
import Badge from '@/components/ui/badge';
import { MagnifyingGlassIcon, BookOpenIcon, MegaphoneIcon, CalendarIcon, DocumentTextIcon, UserIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

const typeIcons: Record<string, any> = {
  course: BookOpenIcon,
  announcement: MegaphoneIcon,
  event: CalendarIcon,
  material: DocumentTextIcon,
  user: UserIcon
};

const typeColors: Record<string, string> = {
  course: 'bg-blue-100 text-blue-700',
  announcement: 'bg-purple-100 text-purple-700',
  event: 'bg-green-100 text-green-700',
  material: 'bg-amber-100 text-amber-700',
  user: 'bg-gray-100 text-gray-700'
};

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  const { data, isLoading } = useQuery({
    queryKey: ['search', query],
    queryFn: async () => {
      const r = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      return r.json();
    },
    enabled: query.length >= 2
  });

  const results = data?.data || [];

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Search Results</h1>
          <p className="text-gray-600 mt-1">
            {isLoading ? 'Searching...' : `${results.length} results for "${query}"`}
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : results.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <MagnifyingGlassIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No results found for &quot;{query}&quot;</p>
            <p className="text-sm text-gray-400 mt-1">Try different keywords or check your spelling</p>
          </div>
        ) : (
          <div className="space-y-3">
            {results.map((result: any, i: number) => {
              const Icon = typeIcons[result.type] || MagnifyingGlassIcon;
              return (
                <Link key={i} href={result.url} className="block bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm hover:border-primary-200 transition-all">
                  <div className="flex items-start">
                    <div className={`p-2 rounded-lg ${typeColors[result.type] || 'bg-gray-100'} mr-4`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <Badge>{result.type}</Badge>
                      </div>
                      <h3 className="font-medium text-gray-900">{result.title}</h3>
                      {result.description && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{result.description}</p>}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default function SearchResultsPage() {
  return (
    <DashboardLayout role="student">
      <Suspense fallback={
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      }>
        <SearchResultsContent />
      </Suspense>
    </DashboardLayout>
  );
}
