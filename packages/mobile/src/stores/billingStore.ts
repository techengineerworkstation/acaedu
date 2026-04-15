import { create } from 'zustand';
import { BillingSubscription, SubscriptionPlan } from '@acadion/shared';

interface BillingState {
  subscription: BillingSubscription | null;
  plans: SubscriptionPlan[];
  isLoading: boolean;
  hasActiveSubscription: boolean;
}

interface BillingActions {
  setSubscription: (subscription: BillingSubscription | null) => void;
  setPlans: (plans: SubscriptionPlan[]) => void;
  refreshSubscription: () => Promise<void>;
  refreshPlans: () => Promise<void>;
}

const initialState: BillingState = {
  subscription: null,
  plans: [],
  isLoading: false,
  hasActiveSubscription: false
};

export const useBillingStore = create<BillingState & BillingActions>((set) => ({
  ...initialState,

  setSubscription: (subscription) =>
    set({
      subscription,
      hasActiveSubscription: !!subscription && subscription.status === 'active'
    }),

  setPlans: (plans) => set({ plans }),

  refreshSubscription: async () => {
    set({ isLoading: true });
    try {
      const response = await fetch(`${API_BASE_URL}/api/billing/subscription`, {
        credentials: 'include'
      });
      const data = await response.json();

      if (data.success) {
        set({ subscription: data.subscription || null, isLoading: false });
      }
    } catch (error) {
      console.error('Subscription fetch error:', error);
      set({ isLoading: false });
    }
  },

  refreshPlans: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/billing/plans`, {
        credentials: 'include'
      });
      const data = await response.json();

      if (data.success) {
        set({ plans: data.plans });
      }
    } catch (error) {
      console.error('Plans fetch error:', error);
    }
  }
}));
