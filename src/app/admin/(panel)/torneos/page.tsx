import type { Metadata } from "next";

import { AdminSections } from "../admin-sections";

export const metadata: Metadata = { title: "Torneos" };

export default function AdminTournamentsPage({
  searchParams,
}: PageProps<"/admin/torneos">) {
  return <AdminSections current="/admin/torneos" searchParams={searchParams} />;
}
