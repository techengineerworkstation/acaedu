import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendBillingEmail } from '@/lib/email/send';

// Lazy init
const getSupabaseAdmin = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key || !url.startsWith('http')) return null;
  return createClient(url, key);
};

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || '';
const PAYPAL_SECRET = process.env.PAYPAL_SECRET || '';
const PAYPAL_BASE_URL = process.env.PAYPAL_MODE === 'live'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

async function verifyWebhookSignature(req: NextRequest, body: string): Promise<boolean> {
  try {
    const tokenRes = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString('base64')}`
      },
      body: 'grant_type=client_credentials'
    });

    if (!tokenRes.ok) return false;
    const { access_token } = await tokenRes.json();

    const verifyRes = await fetch(`${PAYPAL_BASE_URL}/v1/notifications/verify-webhook-signature`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${access_token}`
      },
      body: JSON.stringify({
        auth_algo: 'SHA256',
        cert_url: req.headers.get('Paypal-Cert-Url'),
        transmission_id: req.headers.get('Paypal-Transmission-Id'),
        transmission_sig: req.headers.get('Paypal-Transmission-Sig'),
        transmission_time: req.headers.get('Paypal-Transmission-Time'),
        webhook_id: process.env.PAYPAL_WEBHOOK_ID,
        webhook_event: JSON.parse(body)
      })
    });

    return verifyRes.ok;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const body = await req.text();
    
    if (!await verifyWebhookSignature(req, body)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(body);
    const eventType = event.event_type;

    if (eventType === 'PAYMENT.COMPLETED') {
      const { resource } = event;
      if (supabaseAdmin) {
        await supabaseAdmin
          .from('payments')
          .update({ status: 'completed', updated_at: new Date().toISOString() })
          .eq('reference', resource.invoice_id);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PayPal webhook error:', error);
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
  }
}