'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout variant="cliente">{children}</DashboardLayout>;
}
