import { baseTemplate } from './base';

interface Props {
  userName: string;
  exam: {
    title: string;
    course: string;
    score: number;
    totalMarks: number;
    grade: string;
    feedback?: string;
  };
  appUrl: string;
}

export function examResultTemplate({
  userName,
  exam,
  appUrl
}: Props): string {
  const { title, course, score, totalMarks, grade, feedback } = exam;
  const percentage = ((score / totalMarks) * 100).toFixed(1);

  // Determine grade color
  const gradeColor = () => {
    const gradeNum = parseInt(grade);
    if (gradeNum >= 90) return '#10B981'; // green
    if (gradeNum >= 80) return '#3B82F6'; // blue
    if (gradeNum >= 70) return '#F59E0B'; // amber
    if (gradeNum >= 60) return '#F97316'; // orange
    return '#EF4444'; // red
  };

  return baseTemplate({
    userName,
    appUrl,
    children: `
      <h2 style="margin: 0 0 16px 0; font-size: 20px; color: #111827;">
        Grade Posted: ${title}
      </h2>
      <div style="background: #f9fafb; padding: 16px; border-radius: 6px; margin-bottom: 16px;">
        <p style="margin: 0 0 8px 0;">
          <strong>Course:</strong> ${course}
        </p>
        <p style="margin: 0 0 8px 0;">
          <strong>Score:</strong> ${score} / ${totalMarks} (${percentage}%)
        </p>
        <p style="margin: 0;">
          <strong>Grade:</strong> <span style="color: ${gradeColor()}; font-size: 18px; font-weight: bold;">${grade}</span>
        </p>
      </div>
      ${feedback ? `
        <div style="margin-top: 16px;">
          <h3 style="font-size: 16px; margin-bottom: 8px; color: #374151;">Feedback</h3>
          <p style="background: #f9fafb; padding: 12px; border-radius: 4px; margin-top: 8px; white-space: pre-wrap;">${feedback}</p>
        </div>
      ` : ''}
      <p style="margin-top: 16px;">
        You can view all your grades in the app.
      </p>
    `
  });
}
