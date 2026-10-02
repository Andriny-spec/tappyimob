"use client";

import { use } from "react";
import { redirect } from "next/navigation";

export default function EditCondominioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  redirect(`/admin/imoveis/condominios/novo?id=${id}`);
}
