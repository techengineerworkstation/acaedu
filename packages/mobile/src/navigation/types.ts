export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Onboarding: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  RoleSelection: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Schedule: undefined;
  Courses: undefined;
  Notifications: undefined;
  Profile: undefined;
};

export type StudentStackParamList = {
  StudentDashboard: undefined;
  StudentSchedule: undefined;
  StudentCourses: undefined;
  StudentNotifications: undefined;
  StudentExams: undefined;
  StudentGrades: undefined;
  StudentProfile: undefined;
  CourseDetail: { courseId: string };
  AssignmentDetail: { assignmentId: string };
  ExamDetail: { examId: string };
  EventDetail: { eventId: string };
};

export type LecturerStackParamList = {
  LecturerDashboard: undefined;
  MyCourses: undefined;
  ManageSchedule: undefined;
  CreateAnnouncement: undefined;
  StudentsList: undefined;
  GradesManagement: undefined;
  Profile: undefined;
  CourseDetail: { courseId: string };
  CreateSchedule: { courseId?: string };
  EditSchedule: { scheduleId: string };
};

export type AdminStackParamList = {
  AdminDashboard: undefined;
  UsersManagement: undefined;
  CoursesManagement: undefined;
  SchedulesManagement: undefined;
  AnnouncementsManagement: undefined;
  BillingManagement: undefined;
  BroadcastAnnouncement: undefined;
  Profile: undefined;
  UserDetail: { userId: string };
  CreateUser: undefined;
};

export type DrawerParamList = {
  Home: undefined;
  Settings: undefined;
  About: undefined;
};
