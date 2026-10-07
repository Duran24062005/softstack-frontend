import { requireEducator } from "@/lib/server-api";

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  await requireEducator();
  return children;
}
