"use client";

import { useTransition } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateOrderStatus } from "@/actions/admin";
import { Loader2 } from "lucide-react";

interface AdminOrderActionsProps {
  orderId: string;
  currentStatus: string;
}

const statuses = [
  { value: "PENDING", label: "En attente" },
  { value: "CONFIRMED", label: "Confirmée" },
  { value: "SHIPPED", label: "Expédiée" },
  { value: "DELIVERED", label: "Livrée" },
  { value: "CANCELLED", label: "Annulée" },
];

export default function AdminOrderActions({ orderId, currentStatus }: AdminOrderActionsProps) {
  const [isPending, startTransition] = useTransition();

  const handleChange = (value: string) => {
    startTransition(async () => {
      await updateOrderStatus(orderId, value);
    });
  };

  return (
    <div className="flex items-center justify-end gap-2">
      {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin text-[#9CA3AF]" />}
      <Select value={currentStatus} onValueChange={handleChange} disabled={isPending}>
        <SelectTrigger className="w-36 h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {statuses.map((s) => (
            <SelectItem key={s.value} value={s.value} className="text-xs">
              {s.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
