/**
 * Security configuration for AcaEdu
 * Controls access, allowed emails, and paywall settings
 */

// Allowed admin emails that can always sign up and access the app
export const ALLOWED_ADMIN_EMAILS: string[] = [
  'danielebirim25@gmail.com',
  'chidexibe@gmx.com',
  'merchantenterpriseconnect@yahoo.com',
];

// Emails that can toggle the paywall on/off for testing
export const PAYWALL_TOGGLE_EMAILS: string[] = [
  'chidexibe@gmx.com',
];

// Admin paywall configuration
// When enabled, new admin accounts must pay before activation
export const ADMIN_PAYWALL_ENABLED = true;

// Check if an email is in the allowed list
export function isAllowedEmail(email: string): boolean {
  const normalized = email.toLowerCase().trim();
  return ALLOWED_ADMIN_EMAILS.some(e => e.toLowerCase() === normalized);
}

// Check if an email can toggle the paywall
export function canTogglePaywall(email: string): boolean {
  const normalized = email.toLowerCase().trim();
  return PAYWALL_TOGGLE_EMAILS.some(e => e.toLowerCase() === normalized);
}

// Get the current paywall status
// In a production app, this would read from a database or env variable
let _paywallEnabled = ADMIN_PAYWALL_ENABLED;

export function isPaywallEnabled(): boolean {
  return _paywallEnabled;
}

export function setPaywallEnabled(enabled: boolean): boolean {
  _paywallEnabled = enabled;
  return _paywallEnabled;
}
