'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '@/components/layout/dashboard-layout';
import Modal from '@/components/ui/modal';
import Input from '@/components/ui/input';
import { MapPinIcon, BuildingOfficeIcon, UserGroupIcon } from '@heroicons/react/24/outline';

export default function StudentVenuesPage() {
  const [search, setSearch] = useState('');
  const [selectedVenue, setSelectedVenue] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['venues', search],
    queryFn: async () => {
      const url = search ? `/api/venues?search=${encodeURIComponent(search)}` : '/api/venues';
      const res = await fetch(url);
      return res.json();
    }
  });

  const venues = data?.data || [];

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Class Venues</h1>
          <p className="text-gray-600 mt-1">Find and locate classrooms</p>
        </div>

        <Input
          placeholder="Search venues by name, building, or room number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {venues.map((venue: any) => (
              <div key={venue.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedVenue(venue)}
              >
                <div className="h-40 bg-gray-200">
                  {venue.image_urls?.[0] ? (
                    <img src={venue.image_urls[0]} alt={venue.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <BuildingOfficeIcon className="h-16 w-16 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900">{venue.name}</h3>
                  {venue.building && <p className="text-sm text-gray-500">{venue.building}{venue.floor ? `, Floor ${venue.floor}` : ''}</p>}
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-sm text-gray-500 flex items-center">
                      <UserGroupIcon className="h-4 w-4 mr-1" /> Capacity: {venue.capacity}
                    </span>
                    {venue.room_number && <span className="text-sm font-medium text-primary-600">Room {venue.room_number}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <Modal isOpen={!!selectedVenue} onClose={() => setSelectedVenue(null)} title={selectedVenue?.name || ''} size="lg">
          {selectedVenue && (
            <div className="space-y-4">
              {selectedVenue.image_urls?.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {selectedVenue.image_urls.map((url: string, i: number) => (
                    <img key={i} src={url} alt="" className="w-full h-48 object-cover rounded-lg" />
                  ))}
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div><span className="text-sm text-gray-500">Building:</span><p className="font-medium">{selectedVenue.building || 'N/A'}</p></div>
                <div><span className="text-sm text-gray-500">Floor:</span><p className="font-medium">{selectedVenue.floor || 'N/A'}</p></div>
                <div><span className="text-sm text-gray-500">Room:</span><p className="font-medium">{selectedVenue.room_number || 'N/A'}</p></div>
                <div><span className="text-sm text-gray-500">Capacity:</span><p className="font-medium">{selectedVenue.capacity} seats</p></div>
              </div>
              {selectedVenue.facilities?.length > 0 && (
                <div>
                  <span className="text-sm text-gray-500">Facilities:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedVenue.facilities.map((f: string, i: number) => (
                      <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">{f}</span>
                    ))}
                  </div>
                </div>
              )}
              {selectedVenue.directions && (
                <div><span className="text-sm text-gray-500">Directions:</span><p className="mt-1 text-gray-700">{selectedVenue.directions}</p></div>
              )}
              {selectedVenue.latitude && selectedVenue.longitude && (
                <div className="bg-gray-100 rounded-lg p-4 text-center">
                  <MapPinIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    Location: {selectedVenue.latitude}, {selectedVenue.longitude}
                  </p>
                  <a
                    href={`https://www.google.com/maps?q=${selectedVenue.latitude},${selectedVenue.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary-600 hover:underline mt-1 inline-block"
                  >
                    Open in Google Maps
                  </a>
                </div>
              )}
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
}
