import type { Metadata } from "next";

import { AdminSections } from "../admin-sections";

export const metadata: Metadata = { title: "Atletas" };

export default function AdminAthletesPage({
  searchParams,
}: PageProps<"/admin/atletas">) {
  return <AdminSections current="/admin/atletas" searchParams={searchParams} />;
}
