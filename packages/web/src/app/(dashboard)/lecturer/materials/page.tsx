'use client';

import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DashboardLayout from '@/components/layout/dashboard-layout';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Modal from '@/components/ui/modal';
import Badge from '@/components/ui/badge';
import { toast } from 'react-hot-toast';
import { PlusIcon, TrashIcon, DocumentTextIcon, PhotoIcon, FilmIcon, MusicalNoteIcon, CloudArrowUpIcon, EyeIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { FadeIn, ScrollReveal } from '@/components/ui';

interface Material {
  id: string;
  title: string;
  description?: string;
  file_url: string;
  material_type: string;
  file_type?: string;
  file_size?: number;
  course_id: string;
  course?: { course_code: string; title: string };
  week_number?: number;
  is_published: boolean;
  download_count: number;
  created_at: string;
  updated_at: string;
}

const FILE_TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string; bgColor: string; label: string }> = {
  pdf: { icon: DocumentTextIcon, color: 'text-red-600', bgColor: 'bg-red-100', label: 'PDF' },
  docx: { icon: DocumentTextIcon, color: 'text-blue-600', bgColor: 'bg-blue-100', label: 'Word' },
  doc: { icon: DocumentTextIcon, color: 'text-blue-600', bgColor: 'bg-blue-100', label: 'Word' },
  pptx: { icon: DocumentTextIcon, color: 'text-orange-600', bgColor: 'bg-orange-100', label: 'PowerPoint' },
  xlsx: { icon: DocumentTextIcon, color: 'text-green-600', bgColor: 'bg-green-100', label: 'Excel' },
  png: { icon: PhotoIcon, color: 'text-purple-600', bgColor: 'bg-purple-100', label: 'PNG' },
  jpg: { icon: PhotoIcon, color: 'text-purple-600', bgColor: 'bg-purple-100', label: 'JPG' },
  jpeg: { icon: PhotoIcon, color: 'text-purple-600', bgColor: 'bg-purple-100', label: 'JPG' },
  gif: { icon: PhotoIcon, color: 'text-purple-600', bgColor: 'bg-purple-100', label: 'GIF' },
  mp4: { icon: FilmIcon, color: 'text-pink-600', bgColor: 'bg-pink-100', label: 'Video' },
  mp3: { icon: MusicalNoteIcon, color: 'text-indigo-600', bgColor: 'bg-indigo-100', label: 'Audio' },
  wav: { icon: MusicalNoteIcon, color: 'text-indigo-600', bgColor: 'bg-indigo-100', label: 'Audio' },
  zip: { icon: DocumentTextIcon, color: 'text-yellow-600', bgColor: 'bg-yellow-100', label: 'Archive' },
};

export default function LecturerMaterialsPage() {
  const queryClient = useQueryClient();
  const [showUpload, setShowUpload] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [uploadingFile, setUploadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    course_id: '',
    title: '',
    description: '',
    file_url: '',
    material_type: 'document',
    week_number: '',
  });

  const { data: courses } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const r = await fetch('/api/courses');
      return r.json();
    }
  });

  const { data, isLoading } = useQuery({
    queryKey: ['materials', selectedCourse],
    queryFn: async () => {
      const url = selectedCourse ? `/api/materials?course_id=${selectedCourse}` : '/api/materials';
      const r = await fetch(url);
      return r.json();
    }
  });

  const materials = data?.data || [];

  const uploadMutation = useMutation({
    mutationFn: async (d: any) => {
      const r = await fetch('/api/materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(d)
      });
      return r.json();
    },
    onSuccess: (d: any) => {
      if (d.success) {
        toast.success('Material uploaded successfully!');
        setShowUpload(false);
        setForm({ course_id: '', title: '', description: '', file_url: '', material_type: 'document', week_number: '' });
        queryClient.invalidateQueries({ queryKey: ['materials'] });
      } else {
        toast.error(d.error || 'Failed to upload');
      }
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const r = await fetch(`/api/materials?id=${id}`, { method: 'DELETE' });
      return r.json();
    },
    onSuccess: () => {
      toast.success('Material deleted');
      queryClient.invalidateQueries({ queryKey: ['materials'] });
    }
  });

  const getFileConfig = (url: string, type: string) => {
    const ext = url?.split('.').pop()?.toLowerCase() || type.toLowerCase();
    return FILE_TYPE_CONFIG[ext] || { icon: DocumentTextIcon, color: 'text-gray-600', bgColor: 'bg-gray-100', label: ext.toUpperCase() };
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const mb = bytes / (1024 * 1024);
    if (mb >= 1) return `${mb.toFixed(1)} MB`;
    const kb = bytes / 1024;
    return `${kb.toFixed(0)} KB`;
  };

  const isPreviewable = (url: string) => {
    const ext = url?.split('.').pop()?.toLowerCase();
    return ['png', 'jpg', 'jpeg', 'gif', 'pdf'].includes(ext || '');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);

    const mockUrl = `https://storage.example.com/materials/${Date.now()}_${file.name}`;
    setForm({
      ...form,
      file_url: mockUrl,
      title: form.title || file.name.replace(/\.[^/.]+$/, '')
    });

    setTimeout(() => {
      setUploadingFile(false);
      toast.success('File ready for upload');
    }, 1500);
  };

  return (
    <DashboardLayout role="lecturer">
      <div className="space-y-6">
        <FadeIn direction="down">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Course Materials</h1>
              <p className="text-gray-600 mt-1">Upload and manage PDFs, documents, images, and more</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1 rounded text-sm ${viewMode === 'grid' ? 'bg-white shadow text-gray-900' : 'text-gray-600'}`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1 rounded text-sm ${viewMode === 'list' ? 'bg-white shadow text-gray-900' : 'text-gray-600'}`}
                >
                  List
                </button>
              </div>
              <Button onClick={() => setShowUpload(true)}>
                <PlusIcon className="h-4 w-4 mr-2" />
                Upload Material
              </Button>
            </div>
          </div>
        </FadeIn>

        <div className="flex flex-wrap gap-4 items-center">
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm min-w-[250px] focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
          >
            <option value="">All Courses</option>
            {courses?.data?.map((c: any) => (
              <option key={c.id} value={c.id}>{c.course_code} - {c.title}</option>
            ))}
          </select>
          <span className="text-sm text-gray-500">{materials.length} materials</span>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : materials.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <CloudArrowUpIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No materials uploaded</h3>
            <p className="text-gray-500 mb-4">Upload PDFs, documents, images, and other resources</p>
            <Button onClick={() => setShowUpload(true)}>
              <PlusIcon className="h-4 w-4 mr-2" />
              Upload Material
            </Button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <AnimatePresence>
              {materials.map((m: Material, index: number) => {
                const config = getFileConfig(m.file_url, m.material_type);
                const Icon = config.icon;

                return (
                  <ScrollReveal key={m.id} delay={index * 0.03}>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all group"
                    >
                      <div
                        className={`h-32 ${config.bgColor} flex items-center justify-center relative cursor-pointer`}
                        onClick={() => isPreviewable(m.file_url) && setSelectedMaterial(m)}
                      >
                        <Icon className={`h-12 w-12 ${config.color}`} />
                        {isPreviewable(m.file_url) && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <EyeIcon className="h-8 w-8 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <Badge variant="default" className="text-xs">{config.label}</Badge>
                          {m.week_number && (
                            <span className="text-xs text-gray-500">Week {m.week_number}</span>
                          )}
                        </div>
                        <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">{m.title}</h3>
                        <p className="text-xs text-gray-500 mb-3">
                          {m.course?.course_code} • {formatFileSize(m.file_size)} • {m.download_count} downloads
                        </p>
                        <div className="flex justify-between items-center">
                          <a
                            href={m.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                          >
                            <ArrowDownTrayIcon className="h-4 w-4 inline mr-1" />
                            Download
                          </a>
                          <button
                            onClick={() => {
                              if (confirm('Delete this material?')) {
                                deleteMutation.mutate(m.id);
                              }
                            }}
                            className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  </ScrollReveal>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Week</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Downloads</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {materials.map((m: Material) => {
                  const config = getFileConfig(m.file_url, m.material_type);
                  const Icon = config.icon;

                  return (
                    <tr key={m.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${config.bgColor}`}>
                            <Icon className={`h-5 w-5 ${config.color}`} />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{m.title}</div>
                            <div className="text-xs text-gray-500">{formatFileSize(m.file_size)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {m.course?.course_code}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant="default">{config.label}</Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {m.week_number || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {m.download_count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <a
                          href={m.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-700 mr-4"
                        >
                          Download
                        </a>
                        <button
                          onClick={() => {
                            if (confirm('Delete this material?')) {
                              deleteMutation.mutate(m.id);
                            }
                          }}
                          className="text-red-400 hover:text-red-600"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <Modal isOpen={showUpload} onClose={() => setShowUpload(false)} title="Upload Material" size="lg">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                value={form.course_id}
                onChange={(e) => setForm({ ...form, course_id: e.target.value })}
              >
                <option value="">Select course</option>
                {courses?.data?.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.course_code} - {c.title}</option>
                ))}
              </select>
            </div>

            <Input
              label="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Material title"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">File</label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.png,.jpg,.jpeg,.gif,.mp4,.mp3,.wav,.zip"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  uploadingFile ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
                }`}
              >
                {uploadingFile ? (
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-2"></div>
                    <p className="text-sm text-gray-600">Uploading file...</p>
                  </div>
                ) : form.file_url ? (
                  <div className="flex flex-col items-center">
                    <DocumentTextIcon className="h-10 w-10 text-green-600 mb-2" />
                    <p className="text-sm font-medium text-gray-900">File selected</p>
                    <p className="text-xs text-gray-500">Click to change</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <CloudArrowUpIcon className="h-10 w-10 text-gray-400 mb-2" />
                    <p className="text-sm font-medium text-gray-900">Click to upload</p>
                    <p className="text-xs text-gray-500 mt-1">
                      PDF, DOCX, PPT, XLSX, PNG, JPG, GIF, MP4, MP3, ZIP (max 100MB)
                    </p>
                  </div>
                )}
              </div>
              {form.file_url && (
                <p className="text-xs text-gray-500 mt-1">File URL: {form.file_url}</p>
              )}
            </div>

            <Input
              label="Or Enter File URL"
              value={form.file_url}
              onChange={(e) => setForm({ ...form, file_url: e.target.value })}
              placeholder="https://drive.google.com/... or direct link"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
              <textarea
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Brief description of this material..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={form.material_type}
                  onChange={(e) => setForm({ ...form, material_type: e.target.value })}
                >
                  <option value="document">Document</option>
                  <option value="pdf">PDF</option>
                  <option value="presentation">Presentation</option>
                  <option value="spreadsheet">Spreadsheet</option>
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                  <option value="audio">Audio</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <Input
                label="Week Number"
                type="number"
                value={form.week_number}
                onChange={(e) => setForm({ ...form, week_number: e.target.value })}
                placeholder="1"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="secondary" onClick={() => setShowUpload(false)}>Cancel</Button>
              <Button
                onClick={() => uploadMutation.mutate({
                  ...form,
                  week_number: form.week_number ? parseInt(form.week_number) : null
                })}
                isLoading={uploadMutation.isPending}
                disabled={!form.course_id || !form.title || !form.file_url}
              >
                Upload Material
              </Button>
            </div>
          </div>
        </Modal>

        <Modal
          isOpen={!!selectedMaterial}
          onClose={() => setSelectedMaterial(null)}
          title={selectedMaterial?.title || 'Preview'}
          size="xl"
        >
          {selectedMaterial && (
            <div className="space-y-4">
              {selectedMaterial.file_url?.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                <img
                  src={selectedMaterial.file_url}
                  alt={selectedMaterial.title}
                  className="max-h-[60vh] mx-auto rounded-lg"
                />
              ) : selectedMaterial.file_url?.match(/\.pdf$/i) ? (
                <iframe
                  src={selectedMaterial.file_url}
                  className="w-full h-[60vh] rounded-lg border"
                  title={selectedMaterial.title}
                />
              ) : (
                <div className="text-center py-12">
                  <DocumentTextIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Preview not available for this file type</p>
                  <a
                    href={selectedMaterial.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-block"
                  >
                    <Button>Download File</Button>
                  </a>
                </div>
              )}
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-900">{selectedMaterial.title}</p>
                  <p className="text-xs text-gray-500">{selectedMaterial.course?.course_code}</p>
                </div>
                <a href={selectedMaterial.file_url} target="_blank" rel="noopener noreferrer">
                  <Button>
                    <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </a>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
}
