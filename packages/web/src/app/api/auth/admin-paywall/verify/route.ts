import { NextRequest, NextResponse } from 'next/server';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;

/**
 * GET /api/auth/admin-paywall/verify
 * Paystack callback URL - verifies payment and redirects to registration.
 * Paystack redirects here after the user completes payment.
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const reference = url.searchParams.get('reference') || url.searchParams.get('trxref');

    if (!reference) {
      return NextResponse.redirect(new URL('/register?error=missing_reference', req.url));
    }

    // Verify the transaction with Paystack
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`
      }
    });

    const data = await response.json();

    if (!data.status || data.data.status !== 'success') {
      console.error('Paystack verification failed:', data);
      return NextResponse.redirect(new URL('/register?error=payment_failed', req.url));
    }

    const email = data.data.customer?.email;
    const metadata = data.data.metadata;

    if (!email || metadata?.type !== 'admin_account') {
      return NextResponse.redirect(new URL('/register?error=invalid_payment', req.url));
    }

    // Payment successful - redirect to register with payment confirmed flag
    // The register page will use this to allow admin signup
    const redirectUrl = new URL('/register', req.url);
    redirectUrl.searchParams.set('payment', 'confirmed');
    redirectUrl.searchParams.set('email', email);
    redirectUrl.searchParams.set('ref', reference);

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('Paystack verify error:', error);
    return NextResponse.redirect(new URL('/register?error=verification_error', req.url));
  }
}
