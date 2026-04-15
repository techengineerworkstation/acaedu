import { baseTemplate } from './base';

interface Props {
  userName: string;
  schedule: {
    title: string;
    course: string;
    startTime: string;
    location?: string;
    type: string;
  };
  appUrl: string;
}

export function reminderTemplate({
  userName,
  schedule,
  appUrl
}: Props): string {
  const { title, course, startTime, location, type } = schedule;
  const date = new Date(startTime);
  const formattedDate = date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
  const formattedTime = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  return baseTemplate({
    userName,
    appUrl,
    children: `
      <h2 style="margin: 0 0 16px 0; font-size: 20px; color: #111827;">
        Upcoming ${type}: ${title}
      </h2>
      <div style="background: #f9fafb; padding: 16px; border-radius: 6px; margin-bottom: 16px;">
        <p style="margin: 0 0 8px 0;">
          <strong>Course:</strong> ${course}
        </p>
        <p style="margin: 0 0 8px 0;">
          <strong>Date:</strong> ${formattedDate}
        </p>
        <p style="margin: 0 0 8px 0;">
          <strong>Time:</strong> ${formattedTime}
        </p>
        ${location ? `<p style="margin: 0;"><strong>Location:</strong> ${location}</p>` : ''}
      </div>
      <p>
        Don't forget to attend. You can view your full schedule in the app.
      </p>
    `
  });
}
