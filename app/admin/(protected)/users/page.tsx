import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import AdminUserActions from "./AdminUserActions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Administrateurs" };

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(date));
}

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role: string })?.role;
  if (role !== "SUPER_ADMIN") redirect("/admin");

  const admins = await prisma.admin.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-[#111210]">Administrateurs</h1>
          <p className="text-sm text-[#6B7280] mt-1">{admins.length}/5 comptes</p>
        </div>
        <AdminUserActions mode="create" />
      </div>

      <div className="bg-white rounded-2xl border border-[#E8E8E3] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#F4F4F1] border-b border-[#E8E8E3]">
              <th className="text-left px-4 py-3 font-medium text-[#6B7280] text-xs uppercase tracking-wider">Email</th>
              <th className="text-left px-4 py-3 font-medium text-[#6B7280] text-xs uppercase tracking-wider">Rôle</th>
              <th className="text-left px-4 py-3 font-medium text-[#6B7280] text-xs uppercase tracking-wider hidden sm:table-cell">Créé le</th>
              <th className="text-left px-4 py-3 font-medium text-[#6B7280] text-xs uppercase tracking-wider">Statut</th>
              <th className="text-right px-4 py-3 font-medium text-[#6B7280] text-xs uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E8E8E3]">
            {admins.map((admin: (typeof admins)[0]) => (
              <tr key={admin.id} className="hover:bg-[#FAFAF8] transition-colors">
                <td className="px-4 py-3 font-medium text-[#111210]">{admin.email}</td>
                <td className="px-4 py-3">
                  <Badge variant={admin.role === "SUPER_ADMIN" ? "default" : "secondary"}>
                    {admin.role === "SUPER_ADMIN" ? "Super Admin" : "Admin"}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-[#6B7280] hidden sm:table-cell">{formatDate(admin.createdAt)}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${admin.active ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                    {admin.active ? "Actif" : "Inactif"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <AdminUserActions
                    mode="edit"
                    adminId={admin.id}
                    adminEmail={admin.email}
                    currentRole={admin.role}
                    active={admin.active}
                    isSelf={session?.user?.email === admin.email}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
