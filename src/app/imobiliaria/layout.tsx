'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';

export default function RealEstateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout variant="imobiliaria">{children}</DashboardLayout>;
}
