// WhatsApp integration removed
import { NextResponse } from "next/server";
export async function POST() {
  return NextResponse.json({ message: "WhatsApp integration disabled" }, { status: 410 });
}
