import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Badge, LoadingSpinner } from '../../components/ui';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { CreditCardIcon, TrendingUpIcon, UsersIcon } from '../../constants/icons';

export default function AdminBillingScreen() {
  const mockRevenue = [
    { month: 'Jan', amount: 12500 },
    { month: 'Feb', amount: 15800 },
    { month: 'Mar', amount: 18200 },
    { month: 'Apr', amount: 16400 },
    { month: 'May', amount: 21300 },
    { month: 'Jun', amount: 19500 }
  ];

  const subscriptions = [
    { plan: 'Free', count: 856, percentage: 69 },
    { plan: 'Pro', count: 342, percentage: 27 },
    { plan: 'Enterprise', count: 36, percentage: 4 }
  ];

  const recentPayments = [
    { id: '1', user: 'john@uni.edu', amount: 9.99, plan: 'Pro', status: 'completed', date: '2024-03-28' },
    { id: '2', user: 'jane@uni.edu', amount: 29.99, plan: 'Enterprise', status: 'completed', date: '2024-03-28' },
    { id: '3', user: 'bob@uni.edu', amount: 9.99, plan: 'Pro', status: 'pending', date: '2024-03-27' }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Billing Management</Text>

        {/* Overview Stats */}
        <View style={styles.statsRow}>
          <Card style={styles.statCard} padding="md">
            <TrendingUpIcon size={24} color={COLORS.success} />
            <Text style={styles.statValue}>$21.3k</Text>
            <Text style={styles.statLabel}>Monthly Revenue</Text>
          </Card>
          <Card style={styles.statCard} padding="md">
            <UsersIcon size={24} color={COLORS.primary[600]} />
            <Text style={styles.statValue}>1,234</Text>
            <Text style={styles.statLabel}>Total Users</Text>
          </Card>
        </View>

        {/* Revenue Chart Placeholder */}
        <Card style={styles.chartCard} padding="lg">
          <Text style={styles.sectionTitle}>Revenue Trend</Text>
          <View style={styles.chartBars}>
            {mockRevenue.map((item, idx) => (
              <View key={idx} style={styles.chartBarContainer}>
                <View style={styles.chartBarWrapper}>
                  <View
                    style={[
                      styles.chartBar,
                      { height: `${(item.amount / 22000) * 100}%` }
                    ]}
                  />
                </View>
                <Text style={styles.chartLabel}>{item.month}</Text>
                <Text style={styles.chartValue}>${(item.amount / 1000).toFixed(1)}k</Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Subscriptions Breakdown */}
        <Card style={styles.subscriptionsCard} padding="lg">
          <Text style={styles.sectionTitle}>Subscriptions</Text>
          {subscriptions.map(sub => (
            <View key={sub.plan} style={styles.subscriptionRow}>
              <View style={styles.subscriptionInfo}>
                <Text style={styles.planName}>{sub.plan}</Text>
                <Text style={styles.planCount}>{sub.count} users</Text>
              </View>
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${sub.percentage}%` }
                    ]}
                  />
                </View>
                <Text style={styles.percentage}>{sub.percentage}%</Text>
              </View>
            </View>
          ))}
        </Card>

        {/* Recent Payments */}
        <Card style={styles.paymentsCard} padding="lg">
          <Text style={styles.sectionTitle}>Recent Payments</Text>
          {recentPayments.map(payment => (
            <View key={payment.id} style={styles.paymentRow}>
              <View style={styles.paymentInfo}>
                <Text style={styles.paymentUser}>{payment.user}</Text>
                <Text style={styles.paymentPlan}>{payment.plan} Plan</Text>
              </View>
              <View style={styles.paymentRight}>
                <Text style={[
                  styles.paymentAmount,
                  payment.status === 'completed' ? { color: COLORS.success } : { color: COLORS.warning }
                ]}>
                  ${payment.amount}
                </Text>
                <Badge
                  label={payment.status}
                  variant={payment.status === 'completed' ? 'success' : 'warning'}
                />
              </View>
            </View>
          ))}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[50]
  },
  content: {
    padding: SPACING.lg
  },
  title: {
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.lg
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.lg
  },
  statCard: {
    flex: 1,
    alignItems: 'center'
  },
  statValue: {
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
    marginVertical: SPACING.sm
  },
  statLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    textAlign: 'center'
  },
  chartCard: {
    marginBottom: SPACING.lg
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
    marginBottom: SPACING.lg
  },
  chartBars: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 150
  },
  chartBarContainer: {
    alignItems: 'center',
    flex: 1
  },
  chartBarWrapper: {
    height: 120,
    justifyContent: 'flex-end'
  },
  chartBar: {
    width: 24,
    backgroundColor: COLORS.primary[600],
    borderRadius: BORDER_RADIUS.sm
  },
  chartLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.secondary,
    marginTop: SPACING.xs
  },
  chartValue: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.gray[600],
    marginTop: 2
  },
  subscriptionsCard: {
    marginBottom: SPACING.lg
  },
  subscriptionRow: {
    marginBottom: SPACING.md
  },
  subscriptionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs
  },
  planName: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.text.primary
  },
  planCount: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.gray[200],
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary[600]
  },
  percentage: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    width: 40
  },
  paymentsCard: {
    marginBottom: SPACING.lg
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  paymentInfo: {
    flex: 1
  },
  paymentUser: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.primary,
    marginBottom: 2
  },
  paymentPlan: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary
  },
  paymentRight: {
    alignItems: 'flex-end'
  },
  paymentAmount: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginBottom: 2
  }
});
