import { api } from './client';
import { SubscriptionPlan, BillingSubscription } from '@acadion/shared';

export const billingApi = {
  /**
   * Get available subscription plans
   */
  async getPlans(): Promise<{
    success: boolean;
    plans: SubscriptionPlan[];
    error?: string;
  }> {
    return api.get<SubscriptionPlan[]>('/api/billing/plans');
  },

  /**
   * Initialize payment (redirect to provider)
   */
  async initiateCheckout(planId: string, provider: 'paystack' | 'paypal'): Promise<{
    success: boolean;
    authorization_url?: string;
    reference?: string;
    error?: string;
  }> {
    return api.post<{ authorization_url: string; reference: string }>(
      `/api/billing/checkout?provider=${provider}`,
      { plan_id: planId }
    );
  },

  /**
   * Get current subscription
   */
  async getSubscription(): Promise<{
    success: boolean;
    subscription?: BillingSubscription;
    error?: string;
  }> {
    return api.get<BillingSubscription>('/api/billing/subscription');
  },

  /**
   * Upgrade/downgrade subscription
   */
  async changeSubscription(planId: string): Promise<{
    success: boolean;
    subscription?: BillingSubscription;
    error?: string;
  }> {
    return api.post('/api/billing/upgrade', { plan_id: planId });
  }
};
