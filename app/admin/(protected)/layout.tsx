import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import AdminSidebar from "@/app/admin/AdminSidebar";
import SessionProvider from "@/app/admin/SessionProvider";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  return (
    <SessionProvider session={session}>
      <div className="flex min-h-screen">
        <AdminSidebar session={session} />
        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-6 py-8">{children}</div>
        </main>
      </div>
    </SessionProvider>
  );
}
