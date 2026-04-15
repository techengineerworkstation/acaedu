import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendBillingEmail } from '@/lib/email/send';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID!;
const PAYPAL_SECRET = process.env.PAYPAL_SECRET!;
const PAYPAL_BASE_URL = process.env.PAYPAL_MODE === 'live'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

async function verifyWebhookSignature(req: NextRequest, body: string): Promise<boolean> {
  try {
    const tokenRes = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    });
    const tokenData = await tokenRes.json();

    const verifyRes = await fetch(`${PAYPAL_BASE_URL}/v1/notifications/verify-webhook-signature`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        auth_algo: req.headers.get('paypal-auth-algo'),
        cert_url: req.headers.get('paypal-cert-url'),
        transmission_id: req.headers.get('paypal-transmission-id'),
        transmission_sig: req.headers.get('paypal-transmission-sig'),
        transmission_time: req.headers.get('paypal-transmission-time'),
        webhook_id: process.env.PAYPAL_WEBHOOK_ID,
        webhook_event: JSON.parse(body)
      })
    });

    const verifyData = await verifyRes.json();
    return verifyData.verification_status === 'SUCCESS';
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const isValid = await verifyWebhookSignature(req, body);

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(body);
    const { event_type, resource } = event;

    switch (event_type) {
      case 'BILLING.SUBSCRIPTION.ACTIVATED': {
        const customData = resource.custom_id ? JSON.parse(resource.custom_id) : {};
        const userId = customData.user_id;
        const planId = customData.plan_id || 'pro';

        if (userId) {
          await supabaseAdmin.from('billing_subscriptions').insert({
            user_id: userId,
            plan_id: planId,
            provider: 'paypal',
            provider_subscription_id: resource.id,
            status: 'active',
            current_period_start: resource.start_time,
            current_period_end: resource.billing_info?.next_billing_time || new Date(Date.now() + 30 * 86400000).toISOString()
          });
        }
        break;
      }

      case 'PAYMENT.SALE.COMPLETED': {
        const subscriptionId = resource.billing_agreement_id;
        const { data: subscription } = await supabaseAdmin
          .from('billing_subscriptions')
          .select('user_id, plan_id')
          .eq('provider_subscription_id', subscriptionId)
          .single();

        if (subscription) {
          await supabaseAdmin.from('payments').insert({
            user_id: subscription.user_id,
            provider: 'paypal',
            provider_payment_id: resource.id,
            amount: parseFloat(resource.amount.total),
            currency: resource.amount.currency,
            status: 'completed',
            description: `PayPal payment for ${subscription.plan_id}`,
            paid_at: resource.create_time
          });

          const { data: user } = await supabaseAdmin.from('users').select('email, full_name').eq('id', subscription.user_id).single();
          if (user) {
            sendBillingEmail(user.email, user.full_name, {
              amount: parseFloat(resource.amount.total),
              currency: resource.amount.currency,
              plan: subscription.plan_id,
              status: 'completed',
              periodStart: resource.create_time,
              periodEnd: ''
            });
          }
        }
        break;
      }

      case 'BILLING.SUBSCRIPTION.CANCELLED':
      case 'BILLING.SUBSCRIPTION.SUSPENDED': {
        await supabaseAdmin
          .from('billing_subscriptions')
          .update({ status: 'canceled', canceled_at: new Date().toISOString() })
          .eq('provider_subscription_id', resource.id);
        break;
      }

      case 'BILLING.SUBSCRIPTION.PAYMENT.FAILED': {
        await supabaseAdmin
          .from('billing_subscriptions')
          .update({ status: 'past_due' })
          .eq('provider_subscription_id', resource.id);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('PayPal webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
