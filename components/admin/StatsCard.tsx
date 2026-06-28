import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: number; // percentage change
  icon: React.ReactNode;
  color?: "emerald" | "blue" | "amber" | "red";
}

export default function StatsCard({
  title,
  value,
  subtitle,
  trend,
  icon,
  color = "emerald",
}: StatsCardProps) {
  const colorMap = {
    emerald: "bg-emerald-50 text-emerald-600",
    blue: "bg-blue-50 text-blue-600",
    amber: "bg-amber-50 text-amber-600",
    red: "bg-red-50 text-red-600",
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E8E8E3] p-6">
      <div className="flex items-start justify-between mb-4">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", colorMap[color])}>
          {icon}
        </div>
        {trend !== undefined && (
          <div
            className={cn(
              "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
              trend > 0
                ? "bg-emerald-50 text-emerald-600"
                : trend < 0
                ? "bg-red-50 text-red-600"
                : "bg-gray-50 text-gray-500"
            )}
          >
            {trend > 0 ? (
              <TrendingUp className="w-3 h-3" />
            ) : trend < 0 ? (
              <TrendingDown className="w-3 h-3" />
            ) : (
              <Minus className="w-3 h-3" />
            )}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <p className="text-2xl font-semibold text-[#111210] mb-1">{value}</p>
      <p className="text-sm text-[#6B7280]">{title}</p>
      {subtitle && <p className="text-xs text-[#9CA3AF] mt-1">{subtitle}</p>}
    </div>
  );
}
