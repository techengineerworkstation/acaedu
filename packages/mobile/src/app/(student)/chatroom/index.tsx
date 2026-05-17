import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { formatDistanceToNow } from 'date-fns';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, Badge, LoadingSpinner, EmptyState } from '../../components/ui';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { ChatBubbleLeftRightIcon, SendIcon, BookOpenIcon, UserIcon } from '../../constants/icons';

interface ChatRoom {
  id: string;
  name: string;
  type: 'course' | 'exam' | 'lab';
  course_name?: string;
  last_message?: string;
  unread_count: number;
  updated_at: string;
}

interface Message {
  id: string;
  sender_id: string;
  sender_name: string;
  content: string;
  created_at: string;
}

export default function StudentChatroomScreen() {
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [filter, setFilter] = useState<'all' | 'course' | 'exam' | 'lab'>('all');
  const scrollRef = useRef<ScrollView>(null);

  const { data: roomsData, isLoading: roomsLoading, refetch: refetchRooms } = useQuery({
    queryKey: ['chatrooms'],
    queryFn: async () => {
      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/chatroom`);
      return res.json();
    }
  });

  const { data: messagesData, isLoading: messagesLoading, refetch: refetchMessages } = useQuery({
    queryKey: ['chatroom', selectedRoom?.id],
    queryFn: async () => {
      if (!selectedRoom) return null;
      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/chatroom?room_id=${selectedRoom.id}`);
      return res.json();
    },
    enabled: !!selectedRoom
  });

  const rooms: ChatRoom[] = roomsData?.data || [];
  const messages: Message[] = messagesData?.data || [];

  const filteredRooms = rooms.filter((r: ChatRoom) => {
    if (filter === 'all') return true;
    return r.type === filter;
  });

  const sendMutation = useMutation({
    mutationFn: async (data: { room_id: string; content: string }) => {
      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/chatroom`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return res.json();
    },
    onSuccess: () => {
      setNewMessage('');
      refetchMessages();
    }
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetchRooms();
    if (selectedRoom) await refetchMessages();
    setRefreshing(false);
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedRoom) return;
    sendMutation.mutate({ room_id: selectedRoom.id, content: newMessage });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'course': return '📚';
      case 'exam': return '📝';
      case 'lab': return '🔬';
      default: return '💬';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Discussion Rooms</Text>
        <Text style={styles.subtitle}>Chat with classmates about courses, exams, and labs</Text>
      </View>

      <View style={styles.filterTabs}>
        {(['all', 'course', 'exam', 'lab'] as const).map(f => (
          <TouchableOpacity
            key={f}
            onPress={() => setFilter(f)}
            style={[styles.filterTab, filter === f && styles.filterTabActive]}
          >
            <Text style={[styles.filterTabText, filter === f && styles.filterTabTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <LoadingSpinner />
      ) : selectedRoom ? (
        <View style={styles.chatContainer}>
          <View style={styles.chatHeader}>
            <TouchableOpacity onPress={() => setSelectedRoom(null)} style={styles.backButton}>
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>
            <View style={styles.chatHeaderInfo}>
              <Text style={styles.chatTitle}>{selectedRoom.name}</Text>
              <Text style={styles.chatSubtitle}>{selectedRoom.course_name || selectedRoom.type}</Text>
            </View>
          </View>

          <ScrollView 
            ref={scrollRef}
            style={styles.messagesList}
            contentContainerStyle={styles.messagesContent}
            onContentSizeChange={() => scrollRef.current?.scrollToEnd()}
          >
            {messagesLoading ? (
              <LoadingSpinner />
            ) : messages.length === 0 ? (
              <EmptyState
                icon={<ChatBubbleLeftRightIcon size={48} color={COLORS.gray[400]} />}
                title="No Messages"
                message="Start the conversation!"
              />
            ) : (
              messages.map((msg) => (
                <View 
                  key={msg.id} 
                  style={[styles.messageBubble, msg.sender_id === 'current_user' && styles.messageBubbleOwn]}
                >
                  {msg.sender_id !== 'current_user' && (
                    <View style={styles.senderInfo}>
                      <View style={styles.avatarSmall}>
                        <UserIcon size={12} color={COLORS.gray[500]} />
                      </View>
                      <Text style={styles.senderName}>{msg.sender_name}</Text>
                    </View>
                  )}
                  <View style={[styles.messageContent, msg.sender_id === 'current_user' && styles.messageContentOwn]}>
                    <Text style={[styles.messageText, msg.sender_id === 'current_user' && styles.messageTextOwn]}>
                      {msg.content}
                    </Text>
                  </View>
                  <Text style={[styles.messageTime, msg.sender_id === 'current_user' && styles.messageTimeOwn]}>
                    {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                  </Text>
                </View>
              ))
            )}
          </ScrollView>

          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.inputContainer}
          >
            <TextInput
              style={styles.input}
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="Type a message..."
              multiline
            />
            <TouchableOpacity 
              onPress={sendMessage}
              style={[styles.sendButton, !newMessage.trim() && styles.sendButtonDisabled]}
              disabled={!newMessage.trim()}
            >
              <SendIcon size={20} color="white" />
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </View>
      ) : filteredRooms.length === 0 ? (
        <EmptyState
          icon={<ChatBubbleLeftRightIcon size={48} color={COLORS.gray[400]} />}
          title="No Rooms"
          message="Discussion rooms will appear here"
        />
      ) : (
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {filteredRooms.map((room) => (
            <TouchableOpacity key={room.id} onPress={() => setSelectedRoom(room)}>
              <Card style={styles.roomCard}>
                <View style={styles.roomIcon}>
                  <Text style={styles.roomIconText}>{getTypeIcon(room.type)}</Text>
                </View>
                <View style={styles.roomInfo}>
                  <Text style={styles.roomName}>{room.name}</Text>
                  <Text style={styles.roomLastMessage} numberOfLines={1}>
                    {room.last_message || 'No messages yet'}
                  </Text>
                </View>
                {room.unread_count > 0 && (
                  <Badge label={`${room.unread_count}`} variant="info" />
                )}
              </Card>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[50]
  },
  header: {
    padding: SPACING.lg,
    paddingBottom: SPACING.sm
  },
  title: {
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    marginTop: SPACING.xs
  },
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    gap: SPACING.sm
  },
  filterTab: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.gray[100]
  },
  filterTabActive: {
    backgroundColor: COLORS.primary[600]
  },
  filterTabText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.secondary,
    fontWeight: TYPOGRAPHY.weights.medium
  },
  filterTabTextActive: {
    color: 'white'
  },
  roomCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.sm
  },
  roomIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md
  },
  roomIconText: {
    fontSize: 24
  },
  roomInfo: {
    flex: 1
  },
  roomName: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary
  },
  roomLastMessage: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    marginTop: 2
  },
  chatContainer: {
    flex: 1,
    backgroundColor: COLORS.white
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200]
  },
  backButton: {
    marginRight: SPACING.md
  },
  backText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.primary[600]
  },
  chatHeaderInfo: {
    flex: 1
  },
  chatTitle: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary
  },
  chatSubtitle: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.secondary
  },
  messagesList: {
    flex: 1
  },
  messagesContent: {
    padding: SPACING.md,
    gap: SPACING.md
  },
  messageBubble: {
    maxWidth: '80%',
    alignSelf: 'flex-start'
  },
  messageBubbleOwn: {
    alignSelf: 'flex-end'
  },
  senderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4
  },
  avatarSmall: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.gray[200],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6
  },
  senderName: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.text.secondary
  },
  messageContent: {
    backgroundColor: COLORS.gray[100],
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderBottomLeftRadius: 4
  },
  messageContentOwn: {
    backgroundColor: COLORS.primary[600],
    borderBottomLeftRadius: BORDER_RADIUS.lg,
    borderBottomRightRadius: 4
  },
  messageText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.primary
  },
  messageTextOwn: {
    color: 'white'
  },
  messageTime: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.secondary,
    marginTop: 4
  },
  messageTimeOwn: {
    textAlign: 'right'
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
    backgroundColor: COLORS.white
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.gray[100],
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    maxHeight: 100,
    fontSize: TYPOGRAPHY.sizes.sm
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary[600],
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.sm
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.gray[300]
  }
});
