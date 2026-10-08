export type UserRole = "user" | "trainer" | "admin";
export type AccountStatus = "pending" | "active" | "rejected" | "inactive";

export type User = {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  account_status: AccountStatus;
  email_verified: boolean;
  has_profile_photo: boolean;
  created_at: string;
};

export type AcademicProfile = {
  start_year: number;
  group_name: string;
  campus_name: string;
  linkedin_url: string | null;
  github_url: string | null;
};

export type AcademicProfileInput = {
  start_year: number;
  group_name: string;
  campus_name: string;
  linkedin_url: string | null;
  github_url: string | null;
};

export type AdminUser = User & {
  status_changed_at: string | null;
  status_changed_by: string | null;
};

export type AuthSession = {
  user: User;
  expires_in: number;
  verification_required?: boolean;
  message?: string | null;
};

export type TiptapDocument = {
  type: "doc";
  content: Array<Record<string, unknown>>;
};

export type MediaReference = {
  url: string;
  pathname: string;
  content_type: string;
  size: number;
};

export type Module = {
  id: string;
  title: string;
  slug: string;
  description: string;
  order: number;
  status: "draft" | "published" | "archived";
  cover_media: MediaReference | null;
  created_at: string;
  updated_at: string;
};

export type Lesson = {
  id: string;
  module_id: string;
  title: string;
  slug: string;
  description: string;
  content: TiptapDocument;
  order: number;
  status: "draft" | "published" | "archived";
  estimated_minutes: number;
  created_at: string;
  updated_at: string;
};

export type ProgressSummary = {
  completed_lesson_ids: string[];
  completed_count: number;
  total_lessons: number;
  percentage: number;
  completed_module_ids: string[];
  completed_module_count: number;
  total_modules: number;
  module_percentage: number;
};

export type AnalyticsPeriod = "7d" | "30d" | "90d" | "all";

export type AnalyticsPoint = {
  time: string;
  value: number;
};

export type AnalyticsActivityPoint = {
  time: string;
  lessons_completed: number;
  modules_completed: number;
  assessments_submitted: number;
  total: number;
};

export type AnalyticsSnapshot = {
  completed_lessons: number;
  total_lessons: number;
  percentage: number;
  completed_modules: number;
  total_modules: number;
  module_percentage: number;
};

export type AnalyticsPayload = {
  period: AnalyticsPeriod;
  snapshot: AnalyticsSnapshot;
  active_students: number;
  average_score: number;
  progress_series: AnalyticsPoint[];
  score_series: AnalyticsPoint[];
  activity_series: AnalyticsActivityPoint[];
  failed_competencies: Array<{ competency: string; count: number }>;
};

export type AnalyticsOverview = AnalyticsPayload & {
  students: number;
  assigned_students: number;
  attempts: number;
};

export type AnalyticsStudent = {
  id: string;
  full_name: string;
  email: string;
  attempts: number;
  average_score: number;
  trainer_id: string | null;
};

export type StudentAnalytics = AnalyticsPayload & {
  student_id: string;
  student_name: string;
  trainer_id: string | null;
  attempts: Array<{
    id: string;
    assessment_id: string;
    attempt_number: number;
    cycle: number;
    score: number;
    passed: boolean;
    submitted_at: string;
  }>;
};

export type MyAnalytics = AnalyticsPayload & {
  student_id: string;
  attempts_count: number;
};

export type QuestionOption = { id: string; text: string };

export type AssessmentQuestion = {
  id: string;
  prompt: string;
  options: QuestionOption[];
  competency: string;
  difficulty: string;
};

export type Assessment = {
  id: string;
  target_type: "lesson" | "module";
  target_id: string;
  title: string;
  status: "draft" | "published" | "archived";
  question_count: number;
  passing_score: number;
  max_attempts: number;
  approved_question_count: number;
  attempts_used: number;
  attempts_remaining: number;
  passed: boolean;
  locked: boolean;
  lock_reason: string | null;
  questions: AssessmentQuestion[];
};

export type Attempt = {
  id: string;
  assessment_id: string;
  attempt_number: number;
  cycle: number;
  questions: AssessmentQuestion[];
  attempts_remaining: number;
};

export type AttemptResult = {
  id: string;
  assessment_id: string;
  attempt_number: number;
  cycle: number;
  score: number;
  passed: boolean;
  attempts_used: number;
  attempts_remaining: number;
  question_results: Array<{
    question_id: string;
    selected_option_id: string;
    correct_option_id: string;
    is_correct: boolean;
    explanation: string;
    competency: string;
  }>;
  lesson_completed: boolean;
  module_completed: boolean;
  submitted_at: string;
};

export type AssessmentAdminQuestion = AssessmentQuestion & {
    assessment_id: string;
    correct_option_id: string;
    explanation: string;
    status: "suggested" | "approved" | "archived";
    source_provider: string | null;
    source_model: string | null;
    created_at: string;
    updated_at: string;
};

export type AssessmentAdmin = Omit<Assessment, "questions"> & { questions: AssessmentAdminQuestion[] };

export type ProfileUpdateRequest = {
  full_name?: string;
  email?: string;
  current_password?: string;
  new_password?: string;
};
