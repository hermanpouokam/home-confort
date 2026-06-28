import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDateShort, getStatusLabel } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orders = await prisma.order.findMany({
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  });

  const rows: string[] = [
    ["Numéro", "Statut", "Date", "Client", "Téléphone", "Email", "Ville", "Total"].join(","),
  ];

  for (const order of orders) {
    const customer = order.customer as Record<string, string>;
    const delivery = order.delivery as Record<string, string>;

    rows.push(
      [
        order.orderNumber,
        getStatusLabel(order.status),
        formatDateShort(order.createdAt),
        `"${customer.firstName} ${customer.lastName}"`,
        customer.phone,
        customer.email,
        delivery.city,
        Number(order.total).toFixed(0),
      ].join(",")
    );
  }

  const csv = rows.join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="commandes-homeconfort-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
}
