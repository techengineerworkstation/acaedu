'use client';

import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import DashboardLayout from '@/components/layout/dashboard-layout';
import Badge from '@/components/ui/badge';
import DataTable from '@/components/ui/data-table';
import { CreditCardIcon, BanknotesIcon } from '@heroicons/react/24/outline';
import { useTheme } from '@/contexts/ThemeContext';

export default function AdminBillingPage() {
  const { settings } = useTheme();
  const { data: billingData, isLoading } = useQuery({
    queryKey: ['billing', 'admin'],
    queryFn: async () => {
      const r = await fetch('/api/billing/manage');
      return r.json();
    }
  });

  const subscription = billingData?.data?.subscription;
  const payments = billingData?.data?.payments || [];
  const isExpired = billingData?.data?.is_expired;

  // Get currency symbol
  const currencySymbol = settings?.currency_position === 'after'
    ? (settings?.default_currency_code || 'NGN')
    : (settings?.default_currency_code === 'USD' ? '$' :
       settings?.default_currency_code === 'EUR' ? '€' :
       settings?.default_currency_code === 'GBP' ? '£' :
       settings?.default_currency_code === 'NGN' ? '₦' :
       settings?.default_currency_code === 'GHS' ? '₵' :
       settings?.default_currency_code === 'KES' ? 'KSh' :
       settings?.default_currency_code === 'ZAR' ? 'R' :
       settings?.default_currency_code === 'EGP' ? 'E£' :
       settings?.default_currency_code === 'XOF' ? 'CFA' :
       settings?.default_currency_code === 'UGX' ? 'USh' :
       settings?.default_currency_code === 'TZS' ? 'TSh' :
       settings?.default_currency_code === 'MAD' ? 'د.م.' :
       settings?.default_currency_code || '$');

  const formatCurrency = (amount: number) => {
    const symbol = currencySymbol;
    const position = settings?.currency_position || 'before';
    if (position === 'before') {
      return `${symbol}${amount.toFixed(2)}`;
    } else {
      return `${amount.toFixed(2)} ${symbol}`;
    }
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Billing & Subscription</h1>

        {/* Current Plan */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <CreditCardIcon className="h-5 w-5 mr-2 text-primary-500" />
            Current Subscription
          </h2>
          {subscription ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-500">Plan</p>
                <p className="text-xl font-bold text-gray-900 capitalize">{subscription.plan_name || subscription.plan_id}</p>
                <Badge variant={subscription.status === 'active' ? 'success' : 'error'}>
                  {subscription.status}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-500">Provider</p>
                <p className="font-medium capitalize">{subscription.provider}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Expiry Date</p>
                <p className={`font-medium ${isExpired ? 'text-red-600' : 'text-gray-900'}`}>
                  {format(new Date(subscription.current_period_end), 'MMMM d, yyyy')}
                </p>
                {isExpired && <Badge variant="error">Expired</Badge>}
                {subscription.cancel_at_period_end && <Badge variant="warning">Cancels at period end</Badge>}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <CreditCardIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No active subscription - Free plan</p>
              <p className="text-sm text-gray-400 mt-2">
                Default currency: {settings?.default_currency_code || 'NGN'}
              </p>
            </div>
          )}
        </div>

        {/* Revenue Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center">
              <BanknotesIcon className="h-8 w-8 text-green-500 mr-4" />
              <div>
                <p className="text-sm text-gray-500">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(payments.reduce((sum: number, p: any) => sum + p.amount, 0))}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <p className="text-sm text-gray-500">Active Subscriptions</p>
            <p className="text-2xl font-bold text-gray-900">
              {payments.filter((p: any) => p.status === 'completed').length}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <p className="text-sm text-gray-500">Currency</p>
            <p className="text-2xl font-bold text-gray-900 flex items-center">
              {currencySymbol} {settings?.default_currency_code || 'NGN'}
            </p>
          </div>
        </div>

        {/* Payment History */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment History</h2>
          <DataTable
            columns={[
              { key: 'date', header: 'Date', render: (p: any) => format(new Date(p.created_at), 'MMM d, yyyy') },
              {
                key: 'amount',
                header: 'Amount',
                render: (p: any) => formatCurrency(p.amount)
              },
              { key: 'provider', header: 'Provider', render: (p: any) => <span className="capitalize">{p.provider}</span> },
              {
                key: 'status',
                header: 'Status',
                render: (p: any) => (
                  <Badge variant={p.status === 'completed' ? 'success' : p.status === 'failed' ? 'error' : 'warning'}>
                    {p.status}
                  </Badge>
                )
              },
              { key: 'description', header: 'Description', render: (p: any) => p.description || '-' },
            ]}
            data={payments}
            isLoading={isLoading}
            emptyMessage="No payment history"
          />
        </div>

        {/* Subscription Plans */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Available Plans</h2>
            <a href="/admin/settings" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              Manage Plans →
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Plans will be fetched from settings page API */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="border rounded-lg p-4">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
