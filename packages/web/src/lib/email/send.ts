import { Resend } from 'resend';
import { baseTemplate } from './templates/base';
import { announcementTemplate } from './templates/announcement';
import { reminderTemplate } from './templates/reminder';
import { billingTemplate } from './templates/billing';
import { examResultTemplate } from './templates/exam-result';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
}

/**
 * Send an email using Resend
 */
export async function sendEmail(data: EmailData): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await resend.emails.send({
      from: data.from || process.env.EMAIL_FROM || 'Acaedu <noreply@acadion.com>',
      to: data.to,
      subject: data.subject,
      html: data.html,
      text: data.text,
      reply_to: data.replyTo
    });

    console.log('Email sent:', response.data);
    return { success: true };
  } catch (error: any) {
    console.error('Email send error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send announcement email to a user
 */
export async function sendAnnouncementEmail(
  to: string,
  userName: string,
  announcement: {
    title: string;
    content: string;
    category: string;
    author: string;
    publishedAt: string;
  }
): Promise<{ success: boolean; error?: string }> {
  const html = announcementTemplate({
    userName,
    announcement: {
      title: announcement.title,
      content: announcement.content,
      category: announcement.category,
      author: announcement.author,
      publishedAt: announcement.publishedAt
    },
    appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  });

  const text = announcement.content.replace(/<[^>]*>/g, '').slice(0, 500);

  return sendEmail({
    to,
    subject: `[Acaedu] ${announcement.title}`,
    html,
    text
  });
}

/**
 * Send schedule reminder email
 */
export async function sendScheduleReminderEmail(
  to: string,
  userName: string,
  schedule: {
    title: string;
    course: string;
    startTime: string;
    location?: string;
    type: string;
  }
): Promise<{ success: boolean; error?: string }> {
  const html = reminderTemplate({
    userName,
    schedule,
    appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  });

  return sendEmail({
    to,
    subject: `[Acaedu] Reminder: ${schedule.title}`,
    html,
    text: `Reminder: ${schedule.title} at ${schedule.startTime}`
  });
}

/**
 * Send billing/payment email
 */
export async function sendBillingEmail(
  to: string,
  userName: string,
  payment: {
    amount: number;
    currency: string;
    plan: string;
    status: string;
    periodStart: string;
    periodEnd: string;
    receiptUrl?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  const html = billingTemplate({
    userName,
    payment,
    appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  });

  return sendEmail({
    to,
    subject: `[Acaedu] Payment ${payment.status}: ${payment.plan}`,
    html,
    text: `Payment ${payment.status} for ${payment.plan}: ${payment.amount} ${payment.currency}`
  });
}

/**
 * Send exam result email
 */
export async function sendExamResultEmail(
  to: string,
  userName: string,
  exam: {
    title: string;
    course: string;
    score: number;
    totalMarks: number;
    grade: string;
    feedback?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  const html = examResultTemplate({
    userName,
    exam,
    appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  });

  return sendEmail({
    to,
    subject: `[Acaedu] Grade Posted: ${exam.title}`,
    html,
    text: `Your grade for ${exam.title}: ${exam.grade} (${exam.score}/${exam.totalMarks})`
  });
}
