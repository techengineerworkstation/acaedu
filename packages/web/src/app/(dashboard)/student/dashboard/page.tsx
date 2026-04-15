import DashboardLayout from '@/components/layout/dashboard-layout';
import StudentDashboard from '@/components/dashboard/StudentDashboard';

export default function StudentDashboardPage() {
  return (
    <DashboardLayout role="student">
      <StudentDashboard />
    </DashboardLayout>
  );
}
