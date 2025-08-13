// pages/dashboard.tsx
"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";

export default function DashboardPage() {
  // Artık sahte veri göndermiyoruz; layout kendi içinde fetch edecek
  return <DashboardLayout />;
}
