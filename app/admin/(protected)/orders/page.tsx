import { Metadata } from "next";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { formatPrice, formatDateShort, getStatusLabel, getStatusColor } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Download } from "lucide-react";
import AdminOrderActions from "./AdminOrderActions";
import OrderDetailButton from "./OrderDetailButton";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Commandes" };

interface OrdersPageProps {
  searchParams: { status?: string; search?: string; page?: string };
}

const PAGE_SIZE = 20;

export default async function AdminOrdersPage({ searchParams }: OrdersPageProps) {
  const { status, search, page = "1" } = searchParams;
  const pageNum = Math.max(1, parseInt(page));
  const skip = (pageNum - 1) * PAGE_SIZE;

  const where: Record<string, unknown> = {};
  if (status && status !== "all") where.status = status;
  if (search) where.orderNumber = { contains: search, mode: "insensitive" };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where: where as never,
      include: { items: { include: { product: { select: { name: true } } } } },
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE,
      skip,
    }),
    prisma.order.count({ where: where as never }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const statuses = ["all", "PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-[#111210]">Commandes</h1>
          <p className="text-sm text-[#6B7280] mt-1">{total} commande(s)</p>
        </div>
        <a href="/api/admin/orders/export" className="btn-secondary inline-flex">
          <Download className="w-4 h-4" />
          Exporter CSV
        </a>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        {statuses.map((s) => (
          <a
            key={s}
            href={`/admin/orders?${new URLSearchParams({ ...(s !== "all" ? { status: s } : {}), ...(search ? { search } : {}) }).toString()}`}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm font-medium transition-all",
              (s === "all" && !status) || status === s ? "bg-[#111210] text-white" : "bg-[#F4F4F1] text-[#6B7280] hover:bg-[#E8E8E3]"
            )}
          >
            {s === "all" ? "Toutes" : getStatusLabel(s)}
          </a>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-[#E8E8E3] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#F4F4F1] border-b border-[#E8E8E3]">
              <th className="text-left px-4 py-3 font-medium text-[#6B7280] text-xs uppercase tracking-wider">Commande</th>
              <th className="text-left px-4 py-3 font-medium text-[#6B7280] text-xs uppercase tracking-wider">Client</th>
              <th className="text-left px-4 py-3 font-medium text-[#6B7280] text-xs uppercase tracking-wider hidden md:table-cell">Date</th>
              <th className="text-left px-4 py-3 font-medium text-[#6B7280] text-xs uppercase tracking-wider">Statut</th>
              <th className="text-right px-4 py-3 font-medium text-[#6B7280] text-xs uppercase tracking-wider">Total</th>
              <th className="text-center px-4 py-3 font-medium text-[#6B7280] text-xs uppercase tracking-wider">Détails</th>
              <th className="text-right px-4 py-3 font-medium text-[#6B7280] text-xs uppercase tracking-wider">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E8E8E3]">
            {orders.map((order: (typeof orders)[0]) => {
              const customer = order.customer as Record<string, string>;
              return (
                <tr key={order.id} className="hover:bg-[#FAFAF8] transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-[#111210]">{order.orderNumber}</p>
                    <p className="text-xs text-[#9CA3AF]">{order.items.reduce((a: number, i: { quantity: number }) => a + i.quantity, 0)} article(s)</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{customer.firstName} {customer.lastName}</p>
                    <p className="text-xs text-[#9CA3AF]">{customer.phone}</p>
                  </td>
                  <td className="px-4 py-3 text-[#6B7280] hidden md:table-cell">{formatDateShort(order.createdAt)}</td>
                  <td className="px-4 py-3">
                    <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full", getStatusColor(order.status))}>
                      {getStatusLabel(order.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">{formatPrice(Number(order.total))}</td>
                  <td className="px-4 py-3 text-center">
                    <OrderDetailButton order={{
                      id: order.id,
                      orderNumber: order.orderNumber,
                      status: order.status,
                      total: Number(order.total),
                      createdAt: order.createdAt.toISOString(),
                      customer: order.customer as { firstName: string; lastName: string; email?: string; phone: string },
                      delivery: order.delivery as { address: string; city: string; district: string; zip?: string; mode: string; slot: string; notes?: string },
                      items: order.items.map((item: { id: string; product: { name: unknown }; quantity: number; unitPrice: unknown }) => ({
                        id: item.id,
                        productName: ((item.product?.name as Record<string, string>)?.fr ?? "Produit"),
                        quantity: item.quantity,
                        unitPrice: Number(item.unitPrice),
                      })),
                    }} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Suspense>
                      <AdminOrderActions orderId={order.id} currentStatus={order.status} />
                    </Suspense>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <a
              key={p}
              href={`/admin/orders?${new URLSearchParams({ ...(status ? { status } : {}), ...(search ? { search } : {}), page: String(p) }).toString()}`}
              className={cn("w-8 h-8 rounded-xl flex items-center justify-center text-sm font-medium transition-all", p === pageNum ? "bg-[#111210] text-white" : "bg-[#F4F4F1] text-[#6B7280] hover:bg-[#E8E8E3]")}
            >
              {p}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}