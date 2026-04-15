import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAuth, requireRole } from '@/lib/auth';

// GET current subscription and payment history
export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAuth(req);
    if (!('user' in authResult)) return authResult;

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('user_id') || authResult.user.id;

    // Only admins can view other users' billing
    if (userId !== authResult.user.id && authResult.user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Not authorized' }, { status: 403 });
    }

    const supabase = await createClient();

    const [subscriptionRes, paymentsRes, featureRes] = await Promise.all([
      supabase.from('billing_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single(),
      supabase.from('payments')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20),
      supabase.from('feature_access')
        .select('*')
    ]);

    const currentPlan = subscriptionRes.data?.plan_id || 'free';
    const features = featureRes.data?.filter((f: any) => f.plan_id === currentPlan) || [];

    return NextResponse.json({
      success: true,
      data: {
        subscription: subscriptionRes.data,
        payments: paymentsRes.data || [],
        current_plan: currentPlan,
        features,
        is_expired: subscriptionRes.data
          ? new Date(subscriptionRes.data.current_period_end) < new Date()
          : false,
        expiry_date: subscriptionRes.data?.current_period_end || null
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch billing info' }, { status: 500 });
  }
}

// Cancel subscription
export async function DELETE(req: NextRequest) {
  try {
    const authResult = await requireAuth(req);
    if (!('user' in authResult)) return authResult;

    const supabase = await createClient();

    const { data: subscription } = await supabase
      .from('billing_subscriptions')
      .select('*')
      .eq('user_id', authResult.user.id)
      .eq('status', 'active')
      .single();

    if (!subscription) {
      return NextResponse.json({ success: false, error: 'No active subscription' }, { status: 404 });
    }

    // Cancel with provider
    if (subscription.provider === 'paystack') {
      await fetch(`https://api.paystack.co/subscription/disable`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          code: subscription.provider_subscription_id,
          token: subscription.provider_subscription_id
        })
      });
    } else if (subscription.provider === 'paypal') {
      const tokenRes = await fetch(`${process.env.PAYPAL_MODE === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com'}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials'
      });
      const tokenData = await tokenRes.json();

      await fetch(`${process.env.PAYPAL_MODE === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com'}/v1/billing/subscriptions/${subscription.provider_subscription_id}/cancel`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: 'User requested cancellation' })
      });
    }

    // Update local record
    await supabase
      .from('billing_subscriptions')
      .update({
        cancel_at_period_end: true,
        canceled_at: new Date().toISOString()
      })
      .eq('id', subscription.id);

    return NextResponse.json({ success: true, message: 'Subscription will be canceled at end of billing period' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to cancel subscription' }, { status: 500 });
  }
}
