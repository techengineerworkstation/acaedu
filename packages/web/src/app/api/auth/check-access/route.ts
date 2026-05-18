import { NextRequest, NextResponse } from 'next/server';
import { isAllowedEmail, isPaywallEnabled, canTogglePaywall, setPaywallEnabled } from '@/lib/security';
import { requireAuth } from '@/lib/auth';

/**
 * GET /api/auth/check-access
 * Check if the current user can access the app based on email whitelist and paywall status
 */
export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAuth(req);
    if (!('user' in authResult)) return authResult;

    const user = authResult.user;
    const emailAllowed = isAllowedEmail(user.email);
    const paywallOn = isPaywallEnabled();
    const canToggle = canTogglePaywall(user.email);

    // Admin check: allowed emails always pass
    if (user.role === 'admin') {
      if (emailAllowed) {
        return NextResponse.json({
          success: true,
          allowed: true,
          paywall_enabled: paywallOn,
          can_toggle_paywall: canToggle
        });
      }
      // Non-whitelisted admin needs to have paid
      if (paywallOn) {
        return NextResponse.json({
          success: true,
          allowed: false,
          reason: 'paywall',
          paywall_enabled: true,
          can_toggle_paywall: false
        });
      }
    }

    // Lecturers and students: check if their account is activated
    if (user.role === 'lecturer' || user.role === 'student') {
      // Only allowed emails can freely access
      if (emailAllowed) {
        return NextResponse.json({
          success: true,
          allowed: true,
          paywall_enabled: paywallOn,
          can_toggle_paywall: canToggle
        });
      }
      // Others need admin approval (check is_active in users table)
      return NextResponse.json({
        success: true,
        allowed: true, // They can login but may have limited access
        requires_approval: true,
        paywall_enabled: paywallOn,
        can_toggle_paywall: false
      });
    }

    return NextResponse.json({
      success: true,
      allowed: true,
      paywall_enabled: paywallOn,
      can_toggle_paywall: canToggle
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 });
  }
}

/**
 * POST /api/auth/check-access
 * Toggle paywall on/off (only for authorized emails)
 */
export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth(req);
    if (!('user' in authResult)) return authResult;

    const user = authResult.user;

    if (!canTogglePaywall(user.email)) {
      return NextResponse.json(
        { success: false, error: 'Not authorized to toggle paywall' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { enabled } = body;

    if (typeof enabled !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'enabled must be a boolean' },
        { status: 400 }
      );
    }

    const newState = setPaywallEnabled(enabled);

    return NextResponse.json({
      success: true,
      paywall_enabled: newState,
      message: newState
        ? 'Paywall enabled - new admin accounts must pay'
        : 'Paywall disabled - admin accounts can be created freely'
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 });
  }
}
