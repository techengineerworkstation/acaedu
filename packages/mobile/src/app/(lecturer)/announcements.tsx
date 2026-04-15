import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Badge, Button, Input } from '../../components/ui';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { BellIcon, PlusIcon, SendIcon } from '../../constants/icons';

export default function LecturerAnnouncementsScreen() {
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('general');

  const announcements = [
    {
      id: '1',
      title: 'Midterm Exam Schedule Posted',
      content: 'The midterm examination schedule has been posted...',
      category: 'academic',
      is_published: true,
      created_at: new Date().toISOString(),
      target_roles: ['student']
    },
    {
      id: '2',
      title: 'Course Material Update',
      content: 'New lecture slides have been uploaded to the portal',
      category: 'general',
      is_published: true,
      created_at: new Date(Date.now() - 86400000).toISOString(),
      target_roles: ['student']
    }
  ];

  const categories = [
    { label: 'General', value: 'general' },
    { label: 'Academic', value: 'academic' },
    { label: 'Event', value: 'event' },
    { label: 'Emergency', value: 'emergency' }
  ];

  const handleSend = () => {
    // Would post to API
    console.log('Send announcement:', { title, content, category });
    setShowCreate(false);
    setTitle('');
    setContent('');
    setCategory('general');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Announcements</Text>
          <Button
            title="New"
            onPress={() => setShowCreate(!showCreate)}
            variant="primary"
            size="sm"
            leftIcon={<PlusIcon size={16} color="white" />}
          />
        </View>

        {showCreate && (
          <Card style={styles.createCard} padding="lg">
            <Text style={styles.createTitle}>Create Announcement</Text>
            <Input
              label="Title"
              placeholder="Enter announcement title"
              value={title}
              onChangeText={setTitle}
            />
            <Input
              label="Message"
              placeholder="Enter announcement content"
              value={content}
              onChangeText={setContent}
              multiline
              numberOfLines={4}
              style={styles.textArea}
            />
            <View style={styles.categoryRow}>
              {categories.map(cat => (
                <TouchableOpacity
                  key={cat.value}
                  style={[
                    styles.categoryChip,
                    category === cat.value && styles.categoryChipActive
                  ]}
                  onPress={() => setCategory(cat.value)}
                >
                  <Text style={[
                    styles.categoryText,
                    category === cat.value && styles.categoryTextActive
                  ]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Button
              title="Send Announcement"
              onPress={handleSend}
              fullWidth
              leftIcon={<SendIcon size={16} color="white" />}
              style={styles.sendButton}
            />
          </Card>
        )}

        <FlatList
          data={announcements}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Card style={styles.announcementCard} padding="lg">
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Badge
                  label={categories.find(c => c.value === item.category)?.label || item.category}
                  variant={
                    item.category === 'emergency' ? 'error' :
                    item.category === 'academic' ? 'primary' : 'default'
                  }
                />
              </View>
              <Text style={styles.cardContent} numberOfLines={3}>
                {item.content}
              </Text>
              <View style={styles.cardFooter}>
                <Text style={styles.cardDate}>
                  {new Date(item.created_at).toLocaleDateString()}
                </Text>
                <Badge label={item.is_published ? 'Published' : 'Draft'} variant="success" />
              </View>
            </Card>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[50]
  },
  content: {
    flex: 1
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg
  },
  title: {
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary
  },
  createCard: {
    margin: SPACING.lg,
    marginBottom: 0
  },
  createTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
    marginBottom: SPACING.md
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top'
  },
  categoryRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.md
  },
  categoryChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.gray[100],
    borderWidth: 1,
    borderColor: COLORS.border
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary[600],
    borderColor: COLORS.primary[600]
  },
  categoryText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary
  },
  categoryTextActive: {
    color: 'white',
    fontWeight: TYPOGRAPHY.weights.medium
  },
  sendButton: {
    marginTop: SPACING.md
  },
  list: {
    padding: SPACING.lg,
    paddingTop: 0
  },
  announcementCard: {
    marginBottom: SPACING.md
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm
  },
  cardTitle: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
    marginRight: SPACING.sm
  },
  cardContent: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.secondary,
    lineHeight: TYPOGRAPHY.lineHeights.normal,
    marginBottom: SPACING.md
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  cardDate: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.gray[500]
  }
});
