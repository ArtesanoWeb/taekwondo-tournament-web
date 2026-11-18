import type { Metadata } from "next";

import { AdminSections } from "../admin-sections";

export const metadata: Metadata = { title: "Clubes" };

export default function AdminClubsPage() {
  return <AdminSections current="/admin/clubes" />;
}
