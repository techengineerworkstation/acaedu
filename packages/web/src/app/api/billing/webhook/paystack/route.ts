import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { sendBillingEmail } from '@/lib/email/send';

// Use service role for webhook processing
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('x-paystack-signature');

    // Verify webhook signature
    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!)
      .update(body)
      .digest('hex');

    if (hash !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(body);
    const { event: eventType, data } = event;

    switch (eventType) {
      case 'subscription.create': {
        const userId = data.metadata?.user_id || data.customer?.metadata?.user_id;
        const planId = data.metadata?.plan_id || 'pro';

        await supabaseAdmin.from('billing_subscriptions').insert({
          user_id: userId,
          plan_id: planId,
          provider: 'paystack',
          provider_subscription_id: data.subscription_code,
          status: 'active',
          current_period_start: data.createdAt || new Date().toISOString(),
          current_period_end: data.next_payment_date
        });
        break;
      }

      case 'charge.success': {
        const userId = data.metadata?.user_id;
        if (userId) {
          await supabaseAdmin.from('payments').insert({
            user_id: userId,
            provider: 'paystack',
            provider_payment_id: data.reference,
            amount: data.amount / 100,
            currency: data.currency,
            status: 'completed',
            description: `Payment for ${data.metadata?.plan_id || 'subscription'}`,
            paid_at: data.paid_at || new Date().toISOString()
          });

          // Send email
          const { data: user } = await supabaseAdmin.from('users').select('email, full_name').eq('id', userId).single();
          if (user) {
            sendBillingEmail(user.email, user.full_name, {
              amount: data.amount / 100,
              currency: data.currency,
              plan: data.metadata?.plan_id || 'Pro',
              status: 'completed',
              periodStart: new Date().toISOString(),
              periodEnd: data.next_payment_date || ''
            });
          }
        }
        break;
      }

      case 'subscription.disable':
      case 'subscription.not_renew': {
        const subCode = data.subscription_code;
        await supabaseAdmin
          .from('billing_subscriptions')
          .update({ status: 'canceled', canceled_at: new Date().toISOString() })
          .eq('provider_subscription_id', subCode);
        break;
      }

      case 'invoice.payment_failed': {
        const subCode = data.subscription?.subscription_code;
        if (subCode) {
          await supabaseAdmin
            .from('billing_subscriptions')
            .update({ status: 'past_due' })
            .eq('provider_subscription_id', subCode);
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Paystack webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
