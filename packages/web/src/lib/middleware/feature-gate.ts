import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export type FeatureName =
  | 'unlimited_courses'
  | 'unlimited_notifications'
  | 'push_notifications'
  | 'email_notifications'
  | 'ai_scheduler'
  | 'advanced_analytics'
  | 'priority_support'
  | 'custom_branding';

interface FeatureGateResult {
  allowed: boolean;
  plan: string;
  feature: FeatureName;
  limits?: Record<string, any>;
  error?: string;
}

export async function checkFeatureAccess(
  userId: string,
  feature: FeatureName
): Promise<FeatureGateResult> {
  const supabase = await createClient();

  // Get user's active subscription
  const { data: subscription } = await supabase
    .from('billing_subscriptions')
    .select('plan_id, status, current_period_end')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single();

  const planId = subscription?.plan_id || 'free';

  // Check if subscription is expired
  if (subscription && new Date(subscription.current_period_end) < new Date()) {
    return {
      allowed: false,
      plan: 'free',
      feature,
      error: 'Subscription expired. Please renew to access this feature.'
    };
  }

  // Check feature access for the plan
  const { data: featureAccess } = await supabase
    .from('feature_access')
    .select('*')
    .eq('plan_id', planId)
    .eq('feature', feature)
    .single();

  if (!featureAccess || !featureAccess.is_enabled) {
    return {
      allowed: false,
      plan: planId,
      feature,
      error: `This feature requires a ${feature === 'ai_scheduler' ? 'Pro' : 'higher'} plan. Current plan: ${planId}`
    };
  }

  return {
    allowed: true,
    plan: planId,
    feature,
    limits: featureAccess.limits || {}
  };
}

export function featureGateMiddleware(feature: FeatureName) {
  return async (req: NextRequest, userId: string) => {
    const result = await checkFeatureAccess(userId, feature);

    if (!result.allowed) {
      return NextResponse.json(
        { success: false, error: result.error, upgrade_required: true, current_plan: result.plan },
        { status: 403 }
      );
    }

    return null; // Allowed - continue
  };
}
