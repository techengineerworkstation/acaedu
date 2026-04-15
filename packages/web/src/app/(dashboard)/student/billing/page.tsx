'use client';

import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import DashboardLayout from '@/components/layout/dashboard-layout';
import Button from '@/components/ui/button';
import Badge from '@/components/ui/badge';
import { toast } from 'react-hot-toast';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { PLAN_PRICES } from '@acadion/shared';

const plans = [
  {
    id: 'free', name: 'Free', price: 0, period: '',
    features: [
      { name: 'Up to 5 courses', included: true },
      { name: 'Email notifications', included: true },
      { name: 'Basic schedule view', included: true },
      { name: 'Push notifications', included: false },
      { name: 'AI lecture summaries', included: false },
      { name: 'AI schedule optimizer', included: false },
      { name: 'Advanced analytics', included: false },
      { name: 'Custom branding', included: false },
    ]
  },
  {
    id: 'pro', name: 'Pro', price: 9.99, period: '/month',
    popular: true,
    features: [
      { name: 'Unlimited courses', included: true },
      { name: 'Email notifications', included: true },
      { name: 'Push notifications', included: true },
      { name: 'AI lecture summaries', included: true },
      { name: 'AI schedule optimizer', included: true },
      { name: 'Advanced analytics', included: true },
      { name: 'Priority support', included: false },
      { name: 'Custom branding', included: false },
    ]
  },
  {
    id: 'enterprise', name: 'Enterprise', price: 29.99, period: '/month',
    features: [
      { name: 'Unlimited everything', included: true },
      { name: 'All notifications', included: true },
      { name: 'Push notifications', included: true },
      { name: 'AI lecture summaries', included: true },
      { name: 'AI schedule optimizer', included: true },
      { name: 'Advanced analytics', included: true },
      { name: 'Priority support', included: true },
      { name: 'Custom branding', included: true },
    ]
  }
];

export default function StudentBillingPage() {
  const [selectedProvider, setSelectedProvider] = useState<'paystack' | 'paypal'>('paystack');
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  const { data: billingData } = useQuery({
    queryKey: ['billing'],
    queryFn: async () => { const r = await fetch('/api/billing/manage'); return r.json(); }
  });

  const subscribeMutation = useMutation({
    mutationFn: async ({ planId }: { planId: string }) => {
      const r = await fetch('/api/billing/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan_id: planId, provider: selectedProvider, billing_period: billingPeriod })
      });
      return r.json();
    },
    onSuccess: (data: any) => {
      if (data.success) {
        const url = data.data.authorization_url || data.data.approval_url;
        if (url) window.location.href = url;
      } else {
        toast.error(data.error || 'Failed to start subscription');
      }
    }
  });

  const currentPlan = billingData?.data?.current_plan || 'free';

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subscription Plans</h1>
          <p className="text-gray-600 mt-1">Choose the plan that works best for you</p>
        </div>

        {/* Billing period toggle */}
        <div className="flex justify-center">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button onClick={() => setBillingPeriod('monthly')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${billingPeriod === 'monthly' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}>
              Monthly
            </button>
            <button onClick={() => setBillingPeriod('yearly')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${billingPeriod === 'yearly' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}>
              Yearly <span className="text-green-600 text-xs ml-1">Save 17%</span>
            </button>
          </div>
        </div>

        {/* Payment provider */}
        <div className="flex justify-center space-x-4">
          <button onClick={() => setSelectedProvider('paystack')}
            className={`px-4 py-2 border-2 rounded-lg text-sm font-medium ${selectedProvider === 'paystack' ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-500'}`}>
            Paystack
          </button>
          <button onClick={() => setSelectedProvider('paypal')}
            className={`px-4 py-2 border-2 rounded-lg text-sm font-medium ${selectedProvider === 'paypal' ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-500'}`}>
            PayPal
          </button>
        </div>

        {/* Plans grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const isCurrentPlan = currentPlan === plan.id;
            const price = billingPeriod === 'yearly' ? (plan.price * 10).toFixed(2) : plan.price.toFixed(2);
            return (
              <div key={plan.id} className={`bg-white rounded-xl border-2 p-6 relative ${
                plan.popular ? 'border-primary-500 shadow-lg' : isCurrentPlan ? 'border-green-500' : 'border-gray-200'
              }`}>
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-600 text-white text-xs font-medium px-3 py-1 rounded-full">Popular</span>
                )}
                {isCurrentPlan && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-600 text-white text-xs font-medium px-3 py-1 rounded-full">Current Plan</span>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                  <div className="mt-2">
                    <span className="text-4xl font-bold text-gray-900">${price}</span>
                    {plan.period && <span className="text-gray-500">{billingPeriod === 'yearly' ? '/year' : plan.period}</span>}
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center text-sm">
                      {feature.included ? (
                        <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      ) : (
                        <XMarkIcon className="h-5 w-5 text-gray-300 mr-2 flex-shrink-0" />
                      )}
                      <span className={feature.included ? 'text-gray-700' : 'text-gray-400'}>{feature.name}</span>
                    </li>
                  ))}
                </ul>

                {isCurrentPlan ? (
                  <Button className="w-full" variant="secondary" disabled>Current Plan</Button>
                ) : plan.id === 'free' ? (
                  <Button className="w-full" variant="outline" disabled={currentPlan === 'free'}>
                    {currentPlan === 'free' ? 'Current' : 'Downgrade'}
                  </Button>
                ) : (
                  <Button className="w-full" variant={plan.popular ? 'primary' : 'outline'}
                    onClick={() => subscribeMutation.mutate({ planId: plan.id })}
                    isLoading={subscribeMutation.isPending}>
                    {currentPlan === 'free' ? 'Upgrade' : 'Switch Plan'}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
