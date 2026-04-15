'use client';

import React, { Suspense, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import Button from '@/components/ui/button';
import Modal from '@/components/ui/modal';
import { toast } from 'react-hot-toast';
import { VideoCameraIcon, SparklesIcon, SpeakerWaveIcon, LanguageIcon, PlayIcon } from '@heroicons/react/24/outline';

function StudentVideosContent() {
  const searchParams = useSearchParams();
  const courseId = searchParams.get('course_id');
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [showSummary, setShowSummary] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['videos', courseId],
    queryFn: async () => {
      const url = courseId ? `/api/videos?course_id=${courseId}` : '/api/videos';
      const res = await fetch(url);
      return res.json();
    }
  });

  const summarizeMutation = useMutation({
    mutationFn: async (videoId: string) => {
      const res = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ video_id: videoId })
      });
      return res.json();
    },
    onSuccess: (data: any) => {
      if (data.success) {
        setShowSummary(true);
      } else {
        toast.error(data.error || 'Failed to generate summary');
      }
    }
  });

  const ttsMutation = useMutation({
    mutationFn: async (text: string) => {
      const res = await fetch('/api/ai/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      return res.json();
    },
    onSuccess: (data: any) => {
      if (data.success) {
        const audio = new Audio(`data:audio/mp3;base64,${data.data.audio_base64}`);
        audio.play();
        toast.success('Playing audio...');
      }
    }
  });

  const videos = data?.data || [];

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lecture Videos</h1>
          <p className="text-gray-600 mt-1">Watch recorded lectures and AI-generated summaries</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : videos.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <VideoCameraIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No lecture videos available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video: any) => (
              <div key={video.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative bg-gray-800 h-44 flex items-center justify-center cursor-pointer" onClick={() => setSelectedVideo(video)}>
                  {video.thumbnail_url ? (
                    <img src={video.thumbnail_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <VideoCameraIcon className="h-16 w-16 text-gray-500" />
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <PlayIcon className="h-12 w-12 text-white" />
                  </div>
                  {video.duration_seconds && (
                    <span className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                      {Math.floor(video.duration_seconds / 60)}:{(video.duration_seconds % 60).toString().padStart(2, '0')}
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 line-clamp-2">{video.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{video.course?.course_code} - {video.course?.title}</p>
                  {video.semester && <p className="text-xs text-gray-400 mt-1">{video.semester} {video.academic_year}</p>}
                  <div className="flex items-center space-x-2 mt-3">
                    <Button size="sm" variant="outline" onClick={() => summarizeMutation.mutate(video.id)} isLoading={summarizeMutation.isPending}>
                      <SparklesIcon className="h-3.5 w-3.5 mr-1" /> AI Summary
                    </Button>
                    {video.ai_summary && (
                      <Button size="sm" variant="ghost" onClick={() => ttsMutation.mutate(video.ai_summary)} isLoading={ttsMutation.isPending}>
                        <SpeakerWaveIcon className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Video Player Modal */}
        <Modal isOpen={!!selectedVideo} onClose={() => setSelectedVideo(null)} title={selectedVideo?.title || ''} size="xl">
          {selectedVideo && (
            <div className="space-y-4">
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                {selectedVideo.video_type === 'youtube' ? (
                  <iframe
                    className="w-full h-full"
                    src={selectedVideo.video_url.replace('watch?v=', 'embed/')}
                    allowFullScreen
                  />
                ) : (
                  <video controls className="w-full h-full" src={selectedVideo.video_url}>
                    Your browser does not support video playback.
                  </video>
                )}
              </div>
              <p className="text-sm text-gray-600">{selectedVideo.description}</p>

              {selectedVideo.ai_summary && (
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <h4 className="font-medium text-purple-800 flex items-center mb-2">
                    <SparklesIcon className="h-4 w-4 mr-2" /> AI Summary
                  </h4>
                  <p className="text-sm text-purple-700">{selectedVideo.ai_summary}</p>
                  {selectedVideo.ai_key_points?.length > 0 && (
                    <ul className="mt-3 space-y-1">
                      {selectedVideo.ai_key_points.map((point: string, i: number) => (
                        <li key={i} className="text-sm text-purple-600 flex items-start">
                          <span className="mr-2">•</span>{point}
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="flex space-x-2 mt-3">
                    <Button size="sm" variant="outline" onClick={() => ttsMutation.mutate(selectedVideo.ai_summary)}>
                      <SpeakerWaveIcon className="h-3.5 w-3.5 mr-1" /> Read Aloud
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
}

export default function StudentVideosPage() {
  return (
    <DashboardLayout role="student">
      <Suspense fallback={
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      }>
        <StudentVideosContent />
      </Suspense>
    </DashboardLayout>
  );
}
