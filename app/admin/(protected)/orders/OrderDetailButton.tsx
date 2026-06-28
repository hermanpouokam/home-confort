"use client";

import { useState } from "react";
import { formatPrice, formatDateShort, getStatusLabel, getStatusColor } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { X, MapPin, Phone, Mail, Package, Truck, Eye } from "lucide-react";

interface OrderItem {
    id: string;
    productName: string;
    quantity: number;
    unitPrice: number;
}

interface OrderDetailData {
    id: string;
    orderNumber: string;
    status: string;
    total: number;
    createdAt: string;
    customer: {
        firstName: string;
        lastName: string;
        email?: string;
        phone: string;
    };
    delivery: {
        address: string;
        city: string;
        district: string;
        zip?: string;
        mode: string;
        slot: string;
        notes?: string;
    };
    items: OrderItem[];
}

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

function OrderDetailModal({ order, onClose }: { order: OrderDetailData; onClose: () => void }) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E8E3]">
                    <div>
                        <h2 className="font-semibold text-[#111210]">{order.orderNumber}</h2>
                        <span
                            className={cn(
                                "text-xs font-medium px-2.5 py-0.5 rounded-full mt-1 inline-block",
                                getStatusColor(order.status)
                            )}
                        >
                            {getStatusLabel(order.status)}
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg hover:bg-[#F4F4F1] transition-colors"
                    >
                        <X className="w-4 h-4 text-[#6B7280]" />
                    </button>
                </div>

                <div className="px-6 py-5 space-y-5">
                    {/* Client */}
                    <section>
                        <h3 className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-3">
                            Client
                        </h3>
                        <div className="space-y-1.5">
                            <p className="font-medium text-[#111210]">
                                {order.customer.firstName} {order.customer.lastName}
                            </p>
                            <p className="text-sm text-[#6B7280] flex items-center gap-1.5">
                                <Phone className="w-3.5 h-3.5" />
                                {order.customer.phone}
                            </p>
                            {order.customer.email && (
                                <p className="text-sm text-[#6B7280] flex items-center gap-1.5">
                                    <Mail className="w-3.5 h-3.5" />
                                    {order.customer.email}
                                </p>
                            )}
                        </div>
                    </section>

                    {/* Livraison */}
                    <section>
                        <h3 className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-3">
                            Livraison
                        </h3>
                        <div className="space-y-1.5">
                            <p className="text-sm text-[#6B7280] flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 shrink-0" />
                                {order.delivery.address}, {order.delivery.district}, {order.delivery.city}
                            </p>
                            <p className="text-sm text-[#6B7280] flex items-center gap-1.5">
                                <Truck className="w-3.5 h-3.5 shrink-0" />
                                {deliveryModeLabel[order.delivery.mode] ?? order.delivery.mode}
                                {" — "}
                                {slotLabel[order.delivery.slot] ?? order.delivery.slot}
                            </p>
                            {order.delivery.notes && (
                                <p className="text-sm text-[#6B7280] italic">
                                    Note : {order.delivery.notes}
                                </p>
                            )}
                        </div>
                    </section>

                    {/* Articles */}
                    <section>
                        <h3 className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-3">
                            Articles
                        </h3>
                        <div className="space-y-2">
                            {order.items.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-center justify-between py-2 border-b border-[#F4F4F1] last:border-0"
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-lg bg-[#F4F4F1] flex items-center justify-center shrink-0">
                                            <Package className="w-3.5 h-3.5 text-[#9CA3AF]" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-[#111210]">{item.productName}</p>
                                            <p className="text-xs text-[#9CA3AF]">× {item.quantity}</p>
                                        </div>
                                    </div>
                                    <p className="text-sm font-medium text-[#111210]">
                                        {formatPrice(item.unitPrice * item.quantity)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Total */}
                    <div className="flex items-center justify-between pt-2 border-t border-[#E8E8E3]">
                        <span className="font-semibold text-[#111210]">Total</span>
                        <span className="font-bold text-lg text-[#111210]">
                            {formatPrice(order.total)}
                        </span>
                    </div>

                    <p className="text-xs text-[#9CA3AF] text-right">
                        {formatDateShort(new Date(order.createdAt))}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function OrderDetailButton({ order }: { order: OrderDetailData }) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-medium underline underline-offset-2 transition-colors"
                title="Voir les détails"
            >
                <Eye className="w-3.5 h-3.5" />
                Voir
            </button>

            {open && <OrderDetailModal order={order} onClose={() => setOpen(false)} />}
        </>
    );
}