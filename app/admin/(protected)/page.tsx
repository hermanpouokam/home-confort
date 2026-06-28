import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice, formatDateShort } from "@/lib/utils";
import StatsCard from "@/components/admin/StatsCard";
import RevenueChart from "@/components/admin/RevenueChart";
import OrdersTable from "@/components/admin/OrdersTable";
import { TrendingUp, ShoppingBag, Package, Clock } from "lucide-react";

export const metadata: Metadata = { title: "Dashboard" };

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);

  const now = new Date();
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [
    totalRevenue,
    lastMonthRevenue,
    totalOrders,
    todayOrders,
    activeProducts,
    outOfStockProducts,
    pendingOrders,
    recentOrders,
    ordersByStatus,
    topProducts,
  ] = await Promise.all([
    prisma.order.aggregate({ where: { status: { notIn: ["CANCELLED"] } }, _sum: { total: true } }),
    prisma.order.aggregate({ where: { status: { notIn: ["CANCELLED"] }, createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } }, _sum: { total: true } }),
    prisma.order.count(),
    prisma.order.count({ where: { createdAt: { gte: startOfDay } } }),
    prisma.product.count({ where: { active: true, stock: { gt: 0 } } }),
    prisma.product.count({ where: { active: true, stock: 0 } }),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.findMany({ take: 10, orderBy: { createdAt: "desc" }, include: { items: { include: { product: { select: { name: true } } } } } }),
    prisma.order.groupBy({ by: ["status"], _count: true }),
    prisma.orderItem.groupBy({ by: ["productId"], _sum: { quantity: true }, orderBy: { _sum: { quantity: "desc" } }, take: 5 }),
  ]);

  // Revenue by day (last 30 days)
  const dailyData: { label: string; revenue: number; orders: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const end = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
    const dayOrders = await prisma.order.aggregate({
      where: { createdAt: { gte: start, lt: end }, status: { notIn: ["CANCELLED"] } },
      _sum: { total: true },
      _count: true,
    });
    dailyData.push({
      label: `${date.getDate()}/${date.getMonth() + 1}`,
      revenue: Number(dayOrders._sum.total ?? 0),
      orders: dayOrders._count,
    });
  }

  const statusColors: Record<string, string> = {
    PENDING: "#F59E0B", CONFIRMED: "#60A5FA", SHIPPED: "#8B5CF6", DELIVERED: "#34D399", CANCELLED: "#EF4444",
  };
  const statusLabels: Record<string, string> = {
    PENDING: "En attente", CONFIRMED: "Confirmées", SHIPPED: "Expédiées", DELIVERED: "Livrées", CANCELLED: "Annulées",
  };

  const statusChartData = ordersByStatus.map((s: { status: string; _count: number }) => ({
    name: statusLabels[s.status] ?? s.status,
    value: s._count,
    color: statusColors[s.status] ?? "#9CA3AF",
  }));

  const productIds = topProducts.map((tp: { productId: string }) => tp.productId);
  const productDetails = await prisma.product.findMany({ where: { id: { in: productIds } }, select: { id: true, name: true } });

  const topProductsData = topProducts.map((tp: { productId: string; _sum: { quantity: number | null } }) => {
    const prod = productDetails.find((p: { id: string; name: unknown }) => p.id === tp.productId);
    const name = prod ? (prod.name as Record<string, string>).fr ?? "Produit" : "Produit";
    return { name: name.length > 20 ? name.slice(0, 18) + "…" : name, sales: tp._sum.quantity ?? 0 };
  });

  const thisMonthRev = Number(totalRevenue._sum.total ?? 0);
  const lastMonthRev = Number(lastMonthRevenue._sum.total ?? 0);
  const trend = lastMonthRev > 0 ? Math.round(((thisMonthRev - lastMonthRev) / lastMonthRev) * 100) : 0;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#111210]">
          Bonjour, {session?.user?.email?.split("@")[0]} 👋
        </h1>
        <p className="text-sm text-[#6B7280] mt-1">{formatDateShort(now)}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatsCard title="Chiffre d'affaires" value={formatPrice(thisMonthRev)} subtitle="Ce mois-ci" trend={trend} icon={<TrendingUp className="w-5 h-5" />} color="emerald" />
        <StatsCard title="Commandes" value={String(totalOrders)} subtitle={`${todayOrders} aujourd'hui`} icon={<ShoppingBag className="w-5 h-5" />} color="blue" />
        <StatsCard title="Produits actifs" value={String(activeProducts)} subtitle={`${outOfStockProducts} en rupture`} icon={<Package className="w-5 h-5" />} color={outOfStockProducts > 0 ? "amber" : "emerald"} />
        <StatsCard title="En attente" value={String(pendingOrders)} subtitle="Commandes à traiter" icon={<Clock className="w-5 h-5" />} color={pendingOrders > 0 ? "amber" : "emerald"} />
      </div>

      <div className="mb-8">
        <RevenueChart dailyData={dailyData} statusData={statusChartData} topProducts={topProductsData} />
      </div>

      <div>
        <h2 className="font-semibold text-[#111210] mb-4">10 dernières commandes</h2>
        <OrdersTable orders={recentOrders} />
      </div>
    </div>
  );
}
