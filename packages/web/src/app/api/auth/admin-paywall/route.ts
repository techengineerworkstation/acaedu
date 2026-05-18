import { NextRequest, NextResponse } from 'next/server';
import { isAllowedEmail, isPaywallEnabled } from '@/lib/security';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;

/**
 * POST /api/auth/admin-paywall
 * Initialize a Paystack payment for admin account creation.
 * Called from the register page when an admin email tries to sign up.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Allowed emails bypass the paywall
    if (isAllowedEmail(normalizedEmail)) {
      return NextResponse.json({
        success: true,
        bypass: true,
        message: 'Email is whitelisted, no payment required'
      });
    }

    // Check if paywall is enabled
    if (!isPaywallEnabled()) {
      return NextResponse.json({
        success: true,
        bypass: true,
        message: 'Paywall is currently disabled'
      });
    }

    // Initialize Paystack payment for admin account
    const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://acaedu.sbs'}/api/auth/admin-paywall/verify`;

    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: normalizedEmail,
        amount: 500000, // 5000 NGN in kobo
        callback_url: callbackUrl,
        metadata: {
          type: 'admin_account',
          email: normalizedEmail
        }
      })
    });

    const data = await response.json();

    if (!data.status) {
      console.error('Paystack init error:', data);
      return NextResponse.json(
        { success: false, error: data.message || 'Failed to initialize payment' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      authorization_url: data.data.authorization_url,
      reference: data.data.reference
    });
  } catch (error) {
    console.error('Admin paywall error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
