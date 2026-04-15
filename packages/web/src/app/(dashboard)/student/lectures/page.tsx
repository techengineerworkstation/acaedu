'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '@/components/layout/dashboard-layout';
import Button from '@/components/ui/button';
import Badge from '@/components/ui/badge';
import Modal from '@/components/ui/modal';
import { toast } from 'react-hot-toast';
import { PlayIcon, PauseIcon, SpeakerWaveIcon, SpeakerXMarkIcon, BackwardIcon, ForwardIcon, Cog6ToothIcon, DocumentTextIcon, CodeBracketIcon, ClipboardDocumentListIcon, LightBulbIcon, BookOpenIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { format, formatDuration } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { FadeIn, ScrollReveal } from '@/components/ui';

interface Lecture {
  id: string;
  course_id: string;
  course_name: string;
  title: string;
  description: string;
  lecture_type: 'lecture' | 'lab' | 'exam';
  duration_seconds: number;
  video_url: string;
  audio_url?: string;
  week_number: number;
  month: string;
  semester: string;
  academic_year: string;
  transcription: string;
  captions_url?: string;
  slides_url?: string;
  resources: { name: string; url: string }[];
  view_count: number;
  is_published: boolean;
  created_at: string;
  ai_summary?: string;
  ai_key_points?: string[];
  ai_study_guide?: string;
  ai_flashcards?: { question: string; answer: string }[];
}

interface AIQuiz {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export default function StudentLecturesPage() {
  const [selectedLecture, setSelectedLecture] = useState<Lecture | null>(null);
  const [filter, setFilter] = useState<'all' | 'lecture' | 'lab' | 'exam'>('all');
  const [courseFilter, setCourseFilter] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showTranscription, setShowTranscription] = useState(true);
  const [activeTab, setActiveTab] = useState<'summary' | 'keyPoints' | 'flashcards' | 'quiz'>('summary');
  const [quiz, setQuiz] = useState<AIQuiz[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const { data: lecturesData, isLoading } = useQuery({
    queryKey: ['lectures', courseFilter],
    queryFn: async () => {
      const url = courseFilter ? `/api/lectures?course_id=${courseFilter}` : '/api/lectures';
      const res = await fetch(url);
      return res.json();
    }
  });

  const lectures = lecturesData?.data || [];

  const filteredLectures = lectures.filter((l: Lecture) => {
    if (filter !== 'all' && l.lecture_type !== filter) return false;
    return true;
  });

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'lecture':
        return <Badge variant="info">Lecture</Badge>;
      case 'lab':
        return <Badge variant="success">Lab</Badge>;
      case 'exam':
        return <Badge variant="error">Exam Review</Badge>;
      default:
        return <Badge>Video</Badge>;
    }
  };

  const formatDurationDisplay = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    if (videoRef.current) {
      videoRef.current.volume = vol;
    }
    setIsMuted(vol === 0);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const skip = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
    }
  };

  const generateQuiz = async () => {
    if (!selectedLecture?.transcription) return;
    setIsGeneratingQuiz(true);
    try {
      const res = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'quiz',
          text: selectedLecture.transcription,
          lectureTitle: selectedLecture.title,
          questionCount: 10
        })
      });
      const data = await res.json();
      if (data.success) {
        setQuiz(data.data.quiz || []);
        setQuizAnswers([]);
        setShowQuizModal(true);
      } else {
        toast.error('Failed to generate quiz');
      }
    } catch {
      toast.error('Failed to generate quiz');
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const calculateScore = () => {
    if (quiz.length === 0) return 0;
    let correct = 0;
    quiz.forEach((q, i) => {
      if (quizAnswers[i] === q.correctAnswer) correct++;
    });
    return Math.round((correct / quiz.length) * 100);
  };

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        <FadeIn direction="down">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Recorded Lectures</h1>
              <p className="text-gray-600 mt-1">Watch recordings with AI-generated summaries and study materials</p>
            </div>
          </div>
        </FadeIn>

        <div className="flex flex-wrap gap-3">
          <div className="flex gap-2">
            {(['all', 'lecture', 'lab', 'exam'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === f
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredLectures.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <BookOpenIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No lectures found</h3>
            <p className="text-gray-500">Recorded lectures will appear here</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {filteredLectures.map((lecture: Lecture, index: number) => (
                <ScrollReveal key={lecture.id} delay={index * 0.05}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all cursor-pointer"
                    onClick={() => setSelectedLecture(lecture)}
                  >
                    <div className="h-40 bg-gradient-to-br from-gray-900 to-gray-700 relative flex items-center justify-center">
                      <div className="absolute inset-0 flex items-center justify-center opacity-50">
                        <PlayIcon className="h-16 w-16 text-white" />
                      </div>
                      <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded text-xs text-white">
                        {formatDurationDisplay(lecture.duration_seconds)}
                      </div>
                      {getTypeBadge(lecture.lecture_type)}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{lecture.title}</h3>
                      <p className="text-sm text-gray-500 mb-2">{lecture.course_name}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span>Week {lecture.week_number}</span>
                        <span>•</span>
                        <span>{lecture.view_count} views</span>
                        {lecture.ai_summary && (
                          <>
                            <span>•</span>
                            <Badge variant="success" className="text-xs">AI Summary</Badge>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </ScrollReveal>
              ))}
            </AnimatePresence>
          </div>
        )}

        <Modal
          isOpen={!!selectedLecture}
          onClose={() => { setSelectedLecture(null); setIsPlaying(false); }}
          title={selectedLecture?.title || ''}
          size="xl"
        >
          {selectedLecture && (
            <div className="space-y-4">
              <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
                <video
                  ref={videoRef}
                  src={selectedLecture.video_url}
                  className="w-full h-full"
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
                  onEnded={() => setIsPlaying(false)}
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <input
                    type="range"
                    min="0"
                    max={duration}
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer accent-white"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-3">
                      <button onClick={() => skip(-10)} className="text-white hover:text-primary-300">
                        <BackwardIcon className="h-5 w-5" />
                      </button>
                      <button onClick={handlePlayPause} className="text-white hover:text-primary-300">
                        {isPlaying ? <PauseIcon className="h-6 w-6" /> : <PlayIcon className="h-6 w-6" />}
                      </button>
                      <button onClick={() => skip(10)} className="text-white hover:text-primary-300">
                        <ForwardIcon className="h-5 w-5" />
                      </button>
                      <span className="text-xs text-white">
                        {formatDurationDisplay(currentTime)} / {formatDurationDisplay(duration || selectedLecture.duration_seconds)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button onClick={toggleMute} className="text-white hover:text-primary-300">
                        {isMuted ? <SpeakerXMarkIcon className="h-5 w-5" /> : <SpeakerWaveIcon className="h-5 w-5" />}
                      </button>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={volume}
                        onChange={handleVolumeChange}
                        className="w-20 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer accent-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {getTypeBadge(selectedLecture.lecture_type)}
                <Badge variant="default">{selectedLecture.course_name}</Badge>
                <Badge variant="default">Week {selectedLecture.week_number}</Badge>
                <Badge variant="default">{selectedLecture.duration_seconds / 60} min</Badge>
                <Badge variant="default">{selectedLecture.view_count} views</Badge>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                    <p className="text-sm text-gray-600">{selectedLecture.description}</p>
                  </div>

                  {selectedLecture.transcription && showTranscription && (
                    <div className="bg-gray-50 rounded-lg p-4 mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">Transcription</h4>
                        <button
                          onClick={() => setShowTranscription(false)}
                          className="text-xs text-gray-500 hover:text-gray-700"
                        >
                          Hide
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 whitespace-pre-wrap max-h-48 overflow-y-auto">
                        {selectedLecture.transcription}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">AI Study Materials</h4>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { key: 'summary', icon: DocumentTextIcon, label: 'Summary' },
                        { key: 'keyPoints', icon: LightBulbIcon, label: 'Key Points' },
                        { key: 'flashcards', icon: ClipboardDocumentListIcon, label: 'Flashcards' },
                        { key: 'quiz', icon: CodeBracketIcon, label: 'Quiz', action: generateQuiz },
                      ].map(tab => (
                        <button
                          key={tab.key}
                          onClick={tab.action || (() => setActiveTab(tab.key as any))}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            activeTab === tab.key
                              ? 'bg-primary-600 text-white'
                              : 'bg-white text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          <tab.icon className="h-3 w-3 inline mr-1" />
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    <div className="mt-4 space-y-3 max-h-64 overflow-y-auto">
                      {activeTab === 'summary' && (
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Summary</h5>
                          <p className="text-xs text-gray-600">
                            {selectedLecture.ai_summary || 'No AI summary available. Transcripts will be analyzed when available.'}
                          </p>
                        </div>
                      )}
                      {activeTab === 'keyPoints' && (
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Key Points</h5>
                          {selectedLecture.ai_key_points?.length ? (
                            <ul className="space-y-1">
                              {selectedLecture.ai_key_points.map((point, i) => (
                                <li key={i} className="text-xs text-gray-600 flex items-start gap-2">
                                  <span className="text-primary-600 font-bold">•</span>
                                  {point}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-xs text-gray-500">No key points available</p>
                          )}
                        </div>
                      )}
                      {activeTab === 'flashcards' && (
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Flashcards</h5>
                          {selectedLecture.ai_flashcards?.length ? (
                            <div className="space-y-2">
                              {selectedLecture.ai_flashcards.map((card, i) => (
                                <div key={i} className="bg-white rounded-lg p-2 border">
                                  <p className="text-xs font-medium text-gray-900">{card.question}</p>
                                  <p className="text-xs text-gray-600 mt-1">{card.answer}</p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-gray-500">No flashcards available</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedLecture.resources?.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-4 mt-4">
                      <h4 className="font-medium text-gray-900 mb-3">Resources</h4>
                      <div className="space-y-2">
                        {selectedLecture.resources.map((resource, i) => (
                          <a
                            key={i}
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700"
                          >
                            <DocumentTextIcon className="h-4 w-4" />
                            {resource.name}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </Modal>

        <Modal isOpen={showQuizModal} onClose={() => setShowQuizModal(false)} title="Lecture Quiz" size="lg">
          <div className="space-y-6">
            {quiz.length > 0 && quizAnswers.length === quiz.length && (
              <div className={`p-4 rounded-lg ${calculateScore() >= 70 ? 'bg-green-50' : 'bg-red-50'}`}>
                <h4 className="font-medium mb-2">Your Score: {calculateScore()}%</h4>
                <p className="text-sm text-gray-600">
                  {calculateScore() >= 70 ? 'Great job!' : 'Review the lecture materials and try again.'}
                </p>
              </div>
            )}
            {quiz.map((q, qi) => (
              <div key={qi} className="space-y-3">
                <p className="font-medium text-gray-900">{qi + 1}. {q.question}</p>
                <div className="space-y-2">
                  {q.options.map((option, oi) => (
                    <button
                      key={oi}
                      onClick={() => {
                        const newAnswers = [...quizAnswers];
                        newAnswers[qi] = oi;
                        setQuizAnswers(newAnswers);
                      }}
                      className={`w-full text-left px-4 py-2 rounded-lg border transition-all ${
                        quizAnswers[qi] === oi
                          ? oi === q.correctAnswer
                            ? 'bg-green-100 border-green-500 text-green-900'
                            : 'bg-red-100 border-red-500 text-red-900'
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                {quizAnswers[qi] !== undefined && (
                  <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                    <strong>Explanation:</strong> {q.explanation}
                  </p>
                )}
              </div>
            ))}
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="secondary" onClick={() => setShowQuizModal(false)}>Close</Button>
              {quizAnswers.length === quiz.length && (
                <Button onClick={() => { setQuizAnswers([]); setShowQuizModal(false); }}>
                  Retake Quiz
                </Button>
              )}
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
