import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Badge, Button, Input, Select } from '../../components/ui';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { UserIcon, PlusIcon, SearchIcon } from '../../constants/icons';

export default function AdminUsersScreen() {
  const [search, setSearch] = React.useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const users = [
    { id: '1', full_name: 'John Doe', email: 'john@uni.edu', role: 'student', department: 'CS', status: 'active' },
    { id: '2', full_name: 'Jane Smith', email: 'jane@uni.edu', role: 'lecturer', department: 'MATH', status: 'active' },
    { id: '3', full_name: 'Bob Johnson', email: 'bob@uni.edu', role: 'student', department: 'PHYS', status: 'inactive' },
    { id: '4', full_name: 'Dr. Sarah Wilson', email: 'swilson@uni.edu', role: 'lecturer', department: 'CS', status: 'active' },
    { id: '5', full_name: 'Admin User', email: 'admin@uni.edu', role: 'admin', department: null, status: 'active' }
  ];

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.full_name.toLowerCase().includes(search.toLowerCase()) ||
                          u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const roleOptions = [
    { label: 'All Roles', value: 'all' },
    { label: 'Student', value: 'student' },
    { label: 'Lecturer', value: 'lecturer' },
    { label: 'Admin', value: 'admin' }
  ];

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'primary';
      case 'lecturer': return 'secondary';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? COLORS.success : COLORS.gray[500];
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Users Management</Text>
          <Button
            title="Add User"
            onPress={() => {}}
            variant="primary"
            size="sm"
            leftIcon={<PlusIcon size={16} color="white" />}
          />
        </View>

        {/* Filters */}
        <Card style={styles.filterCard} padding="md">
          <View style={styles.filterRow}>
            <View style={styles.searchContainer}>
              <SearchIcon size={16} color={COLORS.gray[500]} />
              <Input
                placeholder="Search users..."
                value={search}
                onChangeText={setSearch}
                style={styles.searchInput}
                containerStyle={{ flex: 1, marginBottom: 0 }}
              />
            </View>
            <View style={styles.roleFilter}>
              <Select
                options={roleOptions}
                value={roleFilter}
                onChange={setRoleFilter}
                style={{ width: 120 }}
              />
            </View>
          </View>
        </Card>

        {/* Users List */}
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Card style={styles.userCard} padding="md">
              <View style={styles.userHeader}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {item.full_name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{item.full_name}</Text>
                  <Text style={styles.userEmail}>{item.email}</Text>
                  <View style={styles.userMeta}>
                    <Badge label={item.role} variant={getRoleBadgeVariant(item.role)} />
                    {item.department && (
                      <Text style={styles.department}>{item.department}</Text>
                    )}
                  </View>
                </View>
                <TouchableOpacity style={styles.moreButton}>
                  <Text style={styles.moreIcon}>•••</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.cardFooter}>
                <Text style={[
                  styles.statusText,
                  { color: getStatusColor(item.status) }
                ]}>
                  ● {item.status}
                </Text>
                <View style={styles.actions}>
                  <TouchableOpacity>
                    <Text style={styles.actionText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity>
                    <Text style={[styles.actionText, { color: COLORS.error }]}>Remove</Text>
                  </TouchableOpacity>
                </View>
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
    padding: SPACING.lg,
    paddingBottom: SPACING.sm
  },
  title: {
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary
  },
  filterCard: {
    margin: SPACING.lg,
    marginBottom: SPACING.md
  },
  filterRow: {
    flexDirection: 'row',
    gap: SPACING.sm
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm
  },
  searchInput: {
    flex: 1
  },
  roleFilter: {
    width: 120
  },
  list: {
    padding: SPACING.lg,
    paddingTop: 0
  },
  userCard: {
    marginBottom: SPACING.md
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md
  },
  avatarText: {
    fontSize: 20,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary[600]
  },
  userInfo: {
    flex: 1
  },
  userName: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
    marginBottom: 2
  },
  userEmail: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs
  },
  userMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm
  },
  department: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.gray[500]
  },
  moreButton: {
    padding: SPACING.sm
  },
  moreIcon: {
    fontSize: 20,
    color: COLORS.gray[400],
    fontWeight: 'bold'
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border
  },
  statusText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.lg
  },
  actionText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.primary[600],
    fontWeight: TYPOGRAPHY.weights.medium
  }
});

function useState<T>(value: T): [T, (value: T) => void] {
  // Simplified for this component - in real app, use React.useState
  throw new Error('useState must be imported from React');
}
