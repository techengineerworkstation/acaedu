interface TemplateProps {
  userName: string;
  appUrl: string;
  children: React.ReactNode;
}

export function baseTemplate({ userName, appUrl, children }: TemplateProps): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Acaedu Notification</title>
        <style>
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #374151;
            background-color: #f9fafb;
            padding: 20px;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            overflow: hidden;
          }
          .header {
            background-color: #3B82F6;
            color: white;
            padding: 24px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 700;
          }
          .content {
            padding: 32px 24px;
          }
          .footer {
            background-color: #f3f4f6;
            padding: 20px 24px;
            text-align: center;
            font-size: 14px;
            color: #6b7280;
          }
          .footer a {
            color: #3B82F6;
            text-decoration: none;
          }
          .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #3B82F6;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 16px 0;
          }
          .unsubscribe {
            font-size: 12px;
            color: #9ca3af;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Acaedu</h1>
          </div>
          <div class="content">
            <p>Hello ${userName},</p>
            ${children}
            <p>
              <a href="${appUrl}" class="button">Open Acaedu</a>
            </p>
          </div>
          <div class="footer">
            <p>
              &copy; ${new Date().getFullYear()} Acaedu. All rights reserved.
              <br>
              <a href="${appUrl}/privacy">Privacy Policy</a>
            </p>
            <p class="unsubscribe">
              This is an automated notification. Please do not reply to this email.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}
