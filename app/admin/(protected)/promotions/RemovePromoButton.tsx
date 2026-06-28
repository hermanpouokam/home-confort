"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, X } from "lucide-react";
import { removePromo } from "@/actions/admin";

export default function RemovePromoButton({ productId }: { productId: string }) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleRemove = async () => {
        if (!confirm("Retirer cette promotion ?")) return;
        setLoading(true);
        await removePromo(productId);
        router.refresh();
        setLoading(false);
    };

    return (
        <button
            onClick={handleRemove}
            disabled={loading}
            title="Retirer la promotion"
            className="shrink-0 p-1.5 rounded-lg text-[#9CA3AF] hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-50"
        >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
        </button>
    );
}