"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { formatPrice } from "@/lib/utils";

interface DailyData {
  label: string;
  revenue: number;
  orders: number;
}

interface StatusData {
  name: string;
  value: number;
  color: string;
}

interface TopProductData {
  name: string;
  sales: number;
}

interface RevenueChartProps {
  dailyData: DailyData[];
  statusData: StatusData[];
  topProducts: TopProductData[];
}

const COLORS = ["#34D399", "#60A5FA", "#F59E0B", "#EF4444", "#8B5CF6"];

export default function RevenueChart({ dailyData, statusData, topProducts }: RevenueChartProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Revenue line chart */}
      <div className="bg-white rounded-2xl border border-[#E8E8E3] p-6 lg:col-span-2">
        <h3 className="font-semibold text-[#111210] mb-6">Revenus (30 derniers jours)</h3>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={dailyData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F4F4F1" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "#9CA3AF" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#9CA3AF" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              formatter={(value: number) => [formatPrice(value), "Revenus"]}
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #E8E8E3",
                borderRadius: "12px",
                fontSize: "12px",
              }}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#34D399"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4, fill: "#34D399" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Orders by status donut */}
      <div className="bg-white rounded-2xl border border-[#E8E8E3] p-6">
        <h3 className="font-semibold text-[#111210] mb-6">Commandes par statut</h3>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={statusData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={3}
              dataKey="value"
            >
              {statusData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #E8E8E3",
                borderRadius: "12px",
                fontSize: "12px",
              }}
            />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: "12px" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Top products bar chart */}
      <div className="bg-white rounded-2xl border border-[#E8E8E3] p-6">
        <h3 className="font-semibold text-[#111210] mb-6">Top 5 produits vendus</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart
            data={topProducts}
            layout="vertical"
            margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#F4F4F1" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 10, fill: "#6B7280" }}
              axisLine={false}
              tickLine={false}
              width={90}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #E8E8E3",
                borderRadius: "12px",
                fontSize: "12px",
              }}
            />
            <Bar dataKey="sales" fill="#34D399" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
