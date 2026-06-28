"use client";

import { useState } from "react";
import { formatPrice, formatDateShort, getStatusLabel, getStatusColor } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { X, MapPin, Phone, Mail, Package, Truck } from "lucide-react";

interface OrderItem {
  id: string;
  product: { name: unknown };
  quantity: number;
  unitPrice: unknown;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  customer: unknown;
  delivery: unknown;
  total: unknown;
  createdAt: Date;
  items: OrderItem[];
}

interface OrdersTableProps {
  orders: Order[];
}

function OrderDetailModal({ order, onClose }: { order: Order; onClose: () => void }) {
  const customer = order.customer as Record<string, string>;
  const delivery = order.delivery as Record<string, string>;

  const deliveryModeLabel: Record<string, string> = {
    standard: "Standard (24-48h)",
    express: "Express (2-4h)",
    relay: "Point relais",
  };
  const slotLabel: Record<string, string> = {
    morning: "Matin (8h–12h)",
    afternoon: "Après-midi (12h–17h)",
    evening: "Soir (17h–20h)",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E8E3]">
          <div>
            <h2 className="font-semibold text-[#111210]">{order.orderNumber}</h2>
            <span className={cn("text-xs font-medium px-2.5 py-0.5 rounded-full mt-1 inline-block", getStatusColor(order.status))}>
              {getStatusLabel(order.status)}
            </span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#F4F4F1] transition-colors">
            <X className="w-4 h-4 text-[#6B7280]" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Client */}
          <section>
            <h3 className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-3">Client</h3>
            <div className="space-y-1.5">
              <p className="font-medium text-[#111210]">{customer.firstName} {customer.lastName}</p>
              <p className="text-sm text-[#6B7280] flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />{customer.phone}</p>
              {customer.email && <p className="text-sm text-[#6B7280] flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" />{customer.email}</p>}
            </div>
          </section>

          {/* Livraison */}
          <section>
            <h3 className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-3">Livraison</h3>
            <div className="space-y-1.5">
              <p className="text-sm text-[#6B7280] flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                {delivery.address}, {delivery.district}, {delivery.city}
              </p>
              <p className="text-sm text-[#6B7280] flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 shrink-0" />
                {deliveryModeLabel[delivery.mode] ?? delivery.mode} — {slotLabel[delivery.slot] ?? delivery.slot}
              </p>
              {delivery.notes && (
                <p className="text-sm text-[#6B7280] italic">Note : {delivery.notes}</p>
              )}
            </div>
          </section>

          {/* Articles */}
          <section>
            <h3 className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-3">Articles</h3>
            <div className="space-y-2">
              {order.items.map((item) => {
                const name = (item.product?.name as Record<string, string>)?.fr ?? "Produit";
                return (
                  <div key={item.id} className="flex items-center justify-between py-2 border-b border-[#F4F4F1] last:border-0">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-[#F4F4F1] flex items-center justify-center shrink-0">
                        <Package className="w-3.5 h-3.5 text-[#9CA3AF]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#111210]">{name}</p>
                        <p className="text-xs text-[#9CA3AF]">× {item.quantity}</p>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-[#111210]">{formatPrice(Number(item.unitPrice) * item.quantity)}</p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Total */}
          <div className="flex items-center justify-between pt-2 border-t border-[#E8E8E3]">
            <span className="font-semibold text-[#111210]">Total</span>
            <span className="font-bold text-lg text-[#111210]">{formatPrice(Number(order.total))}</span>
          </div>

          <p className="text-xs text-[#9CA3AF] text-right">{formatDateShort(order.createdAt)}</p>
        </div>
      </div>
    </div>
  );
}

export default function OrdersTable({ orders }: OrdersTableProps) {
  const [selected, setSelected] = useState<Order | null>(null);

  return (
    <>
      <div className="overflow-x-auto rounded-2xl border border-[#E8E8E3]">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#F4F4F1] border-b border-[#E8E8E3]">
              <th className="text-left px-4 py-3 font-medium text-[#6B7280] text-xs uppercase tracking-wider">Commande</th>
              <th className="text-left px-4 py-3 font-medium text-[#6B7280] text-xs uppercase tracking-wider">Client</th>
              <th className="text-left px-4 py-3 font-medium text-[#6B7280] text-xs uppercase tracking-wider hidden sm:table-cell">Date</th>
              <th className="text-left px-4 py-3 font-medium text-[#6B7280] text-xs uppercase tracking-wider">Statut</th>
              <th className="text-right px-4 py-3 font-medium text-[#6B7280] text-xs uppercase tracking-wider">Total</th>
              <th className="text-right px-4 py-3 font-medium text-[#6B7280] text-xs uppercase tracking-wider">Détails</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-[#E8E8E3]">
            {orders.map((order) => {
              const customer = order.customer as Record<string, string>;
              return (
                <tr key={order.id} className="hover:bg-[#FAFAF8] transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-[#111210]">{order.orderNumber}</p>
                    <p className="text-xs text-[#9CA3AF]">{order.items.reduce((a, i) => a + i.quantity, 0)} article(s)</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-[#111210]">{customer.firstName} {customer.lastName}</p>
                    <p className="text-xs text-[#9CA3AF]">{customer.phone}</p>
                  </td>
                  <td className="px-4 py-3 text-[#6B7280] hidden sm:table-cell">{formatDateShort(order.createdAt)}</td>
                  <td className="px-4 py-3">
                    <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full", getStatusColor(order.status))}>
                      {getStatusLabel(order.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-[#111210]">{formatPrice(Number(order.total))}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setSelected(order)}
                      className="text-xs text-emerald-600 hover:text-emerald-700 font-medium underline underline-offset-2 transition-colors"
                    >
                      Voir
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selected && <OrderDetailModal order={selected} onClose={() => setSelected(null)} />}
    </>
  );
}
