import { baseTemplate } from './base';

interface Props {
  userName: string;
  payment: {
    amount: number;
    currency: string;
    plan: string;
    status: string;
    periodStart: string;
    periodEnd: string;
    receiptUrl?: string;
  };
  appUrl: string;
}

export function billingTemplate({
  userName,
  payment,
  appUrl
}: Props): string {
  const { amount, currency, plan, status, periodStart, periodEnd, receiptUrl } = payment;
  const startDate = new Date(periodStart);
  const endDate = new Date(periodEnd);
  const formattedPeriod = `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;

  const statusColors: Record<string, string> = {
    completed: '#10B981',
    pending: '#F59E0B',
    failed: '#EF4444'
  };

  const statusBgColors: Record<string, string> = {
    completed: '#D1FAE5',
    pending: '#FEF3C7',
    failed: '#FEE2E2'
  };

  const statusColor = statusColors[status] || '#6B7280';
  const statusBgColor = statusBgColors[status] || '#F3F4F6';

  return baseTemplate({
    userName,
    appUrl,
    children: `
      <h2 style="margin: 0 0 16px 0; font-size: 20px; color: #111827;">
        Payment ${status.charAt(0).toUpperCase() + status.slice(1)}
      </h2>
      <div style="background: ${statusBgColor}; padding: 16px; border-radius: 6px; margin-bottom: 16px;">
        <p style="margin: 0 0 8px 0;">
          <strong>Plan:</strong> ${plan}
        </p>
        <p style="margin: 0 0 8px 0;">
          <strong>Amount:</strong> ${currency} ${amount.toFixed(2)}
        </p>
        <p style="margin: 0 0 8px 0;">
          <strong>Period:</strong> ${formattedPeriod}
        </p>
        <p style="margin: 0 0 0 0;">
          <strong style="color: ${statusColor}">Status: ${status.toUpperCase()}</strong>
        </p>
      </div>
      ${receiptUrl ? `
        <p>
          <a href="${receiptUrl}" class="button" style="display: inline-block; padding: 12px 24px; background-color: #3B82F6; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">
            View Receipt
          </a>
        </p>
      ` : ''}
      <p style="margin-top: 16px;">
        Thank you for using Acaedu!
      </p>
    `
  });
}
