import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "@/app/globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Admin — Vitalis Home and Wellness", template: "%s | Admin Vitalis" },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={plusJakarta.variable}>
      <body className="bg-[#FAFAF8] font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
