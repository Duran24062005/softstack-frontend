import { VerifyEmailForm } from "@/components/auth/verify-email-form";

export default async function VerifyEmailPage({ searchParams }: { searchParams: Promise<{ token?: string; pending?: string; email?: string }> }) {
  const params = await searchParams;
  return <VerifyEmailForm token={params.token} pendingEmail={params.email} />;
}
