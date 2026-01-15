// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css"; // ตรวจสอบว่ามีไฟล์นี้อยู่จริง

export const metadata: Metadata = {
  title: "Product Inventory",
  description: "Next.js 15 Product Management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* ลบ className เก่าที่เรียกใช้ geistSans ออก และใช้ Font มาตรฐานแทน */}
      <body className="antialiased bg-[#f8fafc] text-slate-900 font-sans">
        <nav className="bg-white border-b border-slate-200 sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              Mymju Shop
            </span>
          </div>
        </nav>
        <main className="max-w-5xl mx-auto px-6 py-10">
          {children}
        </main>
      </body>
    </html>
  );
}