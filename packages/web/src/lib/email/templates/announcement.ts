import { baseTemplate } from './base';

interface Props {
  userName: string;
  announcement: {
    title: string;
    content: string;
    category: string;
    author: string;
    publishedAt: string;
  };
  appUrl: string;
}

export function announcementTemplate({
  userName,
  announcement,
  appUrl
}: Props): string {
  const { title, content, category, author, publishedAt } = announcement;

  return baseTemplate({
    userName,
    appUrl,
    children: `
      <h2 style="margin: 0 0 16px 0; font-size: 20px; color: #111827;">
        New Announcement: ${title}
      </h2>
      <div style="background: #f9fafb; padding: 16px; border-radius: 6px; margin-bottom: 16px;">
        <p style="margin: 0 0 8px 0;">
          <strong>Category:</strong> ${category}
        </p>
        <p style="margin: 0 0 8px 0;">
          <strong>From:</strong> ${author}
        </p>
        <p style="margin: 0;">
          <strong>Published:</strong> ${new Date(publishedAt).toLocaleDateString()}
        </p>
      </div>
      <div style="margin-top: 16px;">
        ${content}
      </div>
    `
  });
}
