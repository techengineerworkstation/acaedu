import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth';

// Paystack configuration
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID!;
const PAYPAL_SECRET = process.env.PAYPAL_SECRET!;
const PAYPAL_BASE_URL = process.env.PAYPAL_MODE === 'live'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

const PLAN_PRICES: Record<string, { monthly: number; yearly: number; paystack_plan_code?: string; paypal_plan_id?: string }> = {
  pro: {
    monthly: 999, // in kobo/cents
    yearly: 9999,
    paystack_plan_code: process.env.PAYSTACK_PRO_PLAN_CODE,
    paypal_plan_id: process.env.PAYPAL_PRO_PLAN_ID
  },
  enterprise: {
    monthly: 2999,
    yearly: 29999,
    paystack_plan_code: process.env.PAYSTACK_ENTERPRISE_PLAN_CODE,
    paypal_plan_id: process.env.PAYPAL_ENTERPRISE_PLAN_ID
  }
};

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth(req);
    if (!('user' in authResult)) return authResult;

    const body = await req.json();
    const { plan_id, provider, billing_period } = body;

    if (!plan_id || !provider) {
      return NextResponse.json({ success: false, error: 'plan_id and provider required' }, { status: 400 });
    }

    const plan = PLAN_PRICES[plan_id];
    if (!plan) {
      return NextResponse.json({ success: false, error: 'Invalid plan' }, { status: 400 });
    }

    const amount = billing_period === 'yearly' ? plan.yearly : plan.monthly;

    if (provider === 'paystack') {
      // Initialize Paystack transaction
      const response = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: authResult.user.email,
          amount: amount * 100, // Paystack uses kobo
          currency: 'NGN',
          plan: plan.paystack_plan_code,
          metadata: {
            user_id: authResult.user.id,
            plan_id,
            billing_period,
            custom_fields: [
              { display_name: 'Plan', variable_name: 'plan', value: plan_id },
              { display_name: 'User', variable_name: 'user_id', value: authResult.user.id }
            ]
          },
          callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing/callback?provider=paystack`
        })
      });

      const data = await response.json();
      if (!data.status) {
        return NextResponse.json({ success: false, error: data.message || 'Paystack initialization failed' }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        data: {
          authorization_url: data.data.authorization_url,
          access_code: data.data.access_code,
          reference: data.data.reference
        }
      });
    }

    if (provider === 'paypal') {
      // Get PayPal access token
      const tokenRes = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials'
      });
      const tokenData = await tokenRes.json();

      // Create PayPal subscription
      const subRes = await fetch(`${PAYPAL_BASE_URL}/v1/billing/subscriptions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          plan_id: plan.paypal_plan_id,
          subscriber: {
            name: { given_name: authResult.user.full_name.split(' ')[0], surname: authResult.user.full_name.split(' ').slice(1).join(' ') },
            email_address: authResult.user.email
          },
          application_context: {
            brand_name: 'Acaedu',
            return_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing/callback?provider=paypal`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing/cancel`,
            user_action: 'SUBSCRIBE_NOW'
          },
          custom_id: JSON.stringify({ user_id: authResult.user.id, plan_id, billing_period })
        })
      });

      const subData = await subRes.json();
      const approveLink = subData.links?.find((l: any) => l.rel === 'approve');

      return NextResponse.json({
        success: true,
        data: {
          subscription_id: subData.id,
          approval_url: approveLink?.href,
          provider: 'paypal'
        }
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid provider' }, { status: 400 });
  } catch (error) {
    console.error('Subscription error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create subscription' }, { status: 500 });
  }
}
