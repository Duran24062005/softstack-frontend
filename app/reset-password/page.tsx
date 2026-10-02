import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ email?: string; code?: string }> }) {
  const params = await searchParams;
  return <ResetPasswordForm initialEmail={params.email} initialCode={params.code} />;
}
