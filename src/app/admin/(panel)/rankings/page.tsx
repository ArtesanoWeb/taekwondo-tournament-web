import type { Metadata } from "next";

import { AdminSections } from "../admin-sections";

export const metadata: Metadata = { title: "Rankings" };

export default function RankingsPage() {
  return <AdminSections current="/admin/rankings" />;
}
