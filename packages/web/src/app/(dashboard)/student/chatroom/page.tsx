'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DashboardLayout from '@/components/layout/dashboard-layout';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Modal from '@/components/ui/modal';
import Badge from '@/components/ui/badge';
import { toast } from 'react-hot-toast';
import { ChatBubbleLeftRightIcon, PaperAirplaneIcon, PaperClipIcon, UserIcon, BookOpenIcon, BeakerIcon, DocumentTextIcon, ClockIcon } from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { FadeIn, ScrollReveal } from '@/components/ui';

interface Message {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_role: string;
  content: string;
  attachment_url?: string;
  attachment_type?: string;
  attachment_name?: string;
  created_at: string;
}

interface ChatRoom {
  id: string;
  name: string;
  type: 'course' | 'exam' | 'lab';
  course_id: string;
  course_name?: string;
  last_message?: string;
  unread_count: number;
  updated_at: string;
}

export default function StudentChatroomPage() {
  const queryClient = useQueryClient();
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [filter, setFilter] = useState<'all' | 'course' | 'exam' | 'lab'>('all');

  const { data: roomsData, isLoading: roomsLoading } = useQuery({
    queryKey: ['chatrooms'],
    queryFn: async () => {
      const res = await fetch('/api/chatroom');
      return res.json();
    }
  });

  const { data: messagesData, isLoading: messagesLoading } = useQuery({
    queryKey: ['chatroom', selectedRoom?.id],
    queryFn: async () => {
      if (!selectedRoom) return null;
      const res = await fetch(`/api/chatroom?room_id=${selectedRoom.id}`);
      return res.json();
    },
    enabled: !!selectedRoom
  });

  const rooms = roomsData?.data || [];
  const messages = messagesData?.data || [];

  const filteredRooms = rooms.filter((r: ChatRoom) => {
    if (filter === 'all') return true;
    return r.type === filter;
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (data: { room_id: string; content: string }) => {
      const res = await fetch('/api/chatroom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return res.json();
    },
    onSuccess: (data: { success: boolean; error?: string }) => {
      if (data.success) {
        setNewMessage('');
        queryClient.invalidateQueries({ queryKey: ['chatroom', selectedRoom?.id] });
      } else {
        toast.error(data.error || 'Failed to send message');
      }
    }
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'course':
        return <BookOpenIcon className="h-5 w-5" />;
      case 'exam':
        return <DocumentTextIcon className="h-5 w-5" />;
      case 'lab':
        return <BeakerIcon className="h-5 w-5" />;
      default:
        return <ChatBubbleLeftRightIcon className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'course':
        return 'bg-blue-100 text-blue-600';
      case 'exam':
        return 'bg-red-100 text-red-600';
      case 'lab':
        return 'bg-green-100 text-green-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <DashboardLayout role="student">
      <div className="h-[calc(100vh-8rem)] flex rounded-xl overflow-hidden border border-gray-200 bg-white">
        <AnimatePresence mode="wait">
          {!selectedRoom ? (
            <motion.div
              key="room-list"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full md:w-96 border-r border-gray-200 flex flex-col"
            >
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Discussion Rooms</h2>
                </div>
                <div className="flex gap-2">
                  {(['all', 'course', 'exam', 'lab'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                        filter === f
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {roomsLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                  </div>
                ) : filteredRooms.length === 0 ? (
                  <div className="p-8 text-center">
                    <ChatBubbleLeftRightIcon className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">No discussion rooms available</p>
                  </div>
                ) : (
                  filteredRooms.map((room: ChatRoom) => (
                    <button
                      key={room.id}
                      onClick={() => setSelectedRoom(room)}
                      className="w-full p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${getTypeColor(room.type)}`}>
                          {getTypeIcon(room.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-gray-900 truncate">{room.name}</h3>
                            {room.unread_count > 0 && (
                              <Badge variant="info" className="text-xs px-2 py-0.5">
                                {room.unread_count}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 truncate">{room.last_message || 'No messages yet'}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {formatDistanceToNow(new Date(room.updated_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="chat-view"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex-1 flex flex-col"
            >
              <div className="p-4 border-b border-gray-200 flex items-center gap-3">
                <button
                  onClick={() => setSelectedRoom(null)}
                  className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div className={`p-2 rounded-lg ${getTypeColor(selectedRoom.type)}`}>
                  {getTypeIcon(selectedRoom.type)}
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">{selectedRoom.name}</h2>
                  <p className="text-xs text-gray-500">{selectedRoom.course_name || selectedRoom.type}</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messagesLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-12">
                    <ChatBubbleLeftRightIcon className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((msg: Message, index: number) => (
                    <ScrollReveal key={msg.id} delay={index * 0.02}>
                      <div className={`flex ${msg.sender_id === 'current_user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] ${msg.sender_id === 'current_user' ? 'order-2' : ''}`}>
                          {msg.sender_id !== 'current_user' && (
                            <div className="flex items-center gap-2 mb-1">
                              <div className="p-1 bg-gray-200 rounded-full">
                                <UserIcon className="h-3 w-3 text-gray-600" />
                              </div>
                              <span className="text-xs font-medium text-gray-700">{msg.sender_name}</span>
                              <span className="text-xs text-gray-400 capitalize">{msg.sender_role}</span>
                            </div>
                          )}
                          <div className={`rounded-2xl px-4 py-2 ${
                            msg.sender_id === 'current_user'
                              ? 'bg-primary-600 text-white rounded-br-sm'
                              : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                          }`}>
                            <p className="text-sm">{msg.content}</p>
                            {msg.attachment_url && (
                              <a
                                href={msg.attachment_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex items-center gap-2 mt-2 text-xs ${
                                  msg.sender_id === 'current_user' ? 'text-primary-200' : 'text-primary-600'
                                }`}
                              >
                                <PaperClipIcon className="h-3 w-3" />
                                {msg.attachment_name || 'Attachment'}
                              </a>
                            )}
                          </div>
                          <p className={`text-xs text-gray-400 mt-1 ${
                            msg.sender_id === 'current_user' ? 'text-right' : ''
                          }`}>
                            {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    </ScrollReveal>
                  ))
                )}
              </div>

              <div className="p-4 border-t border-gray-200">
                <div className="flex items-end gap-2">
                  <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
                    <PaperClipIcon className="h-5 w-5" />
                  </button>
                  <div className="flex-1">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      rows={1}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          if (newMessage.trim()) {
                            sendMessageMutation.mutate({ room_id: selectedRoom.id, content: newMessage });
                          }
                        }
                      }}
                    />
                  </div>
                  <Button
                    onClick={() => {
                      if (newMessage.trim()) {
                        sendMessageMutation.mutate({ room_id: selectedRoom.id, content: newMessage });
                      }
                    }}
                    isLoading={sendMessageMutation.isPending}
                    disabled={!newMessage.trim()}
                  >
                    <PaperAirplaneIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
