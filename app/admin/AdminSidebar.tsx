"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LayoutDashboard, Package, ShoppingBag, Users, LogOut, Zap, ExternalLink, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Session } from "next-auth";

interface AdminSidebarProps {
  session: Session;
}

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Produits", icon: Package },
  { href: "/admin/orders", label: "Commandes", icon: ShoppingBag },
  { href: "/admin/promotions", label: "Promotions", icon: Tag },
  { href: "/admin/users", label: "Admins", icon: Users, superOnly: true },
];

export default function AdminSidebar({ session }: AdminSidebarProps) {
  const pathname = usePathname();
  const role = (session.user as { role: string })?.role;
  const isSuperAdmin = role === "SUPER_ADMIN";

  return (
    <aside className="w-64 bg-[#111210] text-white flex flex-col min-h-screen shrink-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-400 rounded-xl flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-lg">
            Home<span className="text-emerald-400">Confort</span>
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-1">Administration</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          if (item.superOnly && !isSuperAdmin) return null;
          const Icon = item.icon;
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                isActive
                  ? "bg-emerald-400 text-white"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-white/10 space-y-1">
        <Link
          href="/fr"
          target="_blank"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:bg-white/5 hover:text-white transition-all"
        >
          <ExternalLink className="w-4 h-4" />
          Voir le site
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all w-full"
        >
          <LogOut className="w-4 h-4" />
          Déconnexion
        </button>

        {/* User info */}
        <div className="px-3 py-3 mt-2">
          <p className="text-xs font-medium text-white truncate">{session.user?.email}</p>
          <p className="text-xs text-gray-500">{isSuperAdmin ? "Super Admin" : "Admin"}</p>
        </div>
      </div>
    </aside>
  );
}