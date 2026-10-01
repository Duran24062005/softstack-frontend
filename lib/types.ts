export type UserRole = "user" | "admin";

export type User = {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
};

export type AuthSession = {
  user: User;
  expires_in: number;
};

export type TiptapDocument = {
  type: "doc";
  content: Array<Record<string, unknown>>;
};

export type Module = {
  id: string;
  title: string;
  slug: string;
  description: string;
  order: number;
  status: "draft" | "published" | "archived";
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
};

export type ProfileUpdateRequest = {
  full_name?: string;
  email?: string;
  current_password?: string;
  new_password?: string;
};
