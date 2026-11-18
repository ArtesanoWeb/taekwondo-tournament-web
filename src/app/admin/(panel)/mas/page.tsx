import type { Metadata } from "next";

import { AdminSections } from "../admin-sections";

export const metadata: Metadata = { title: "Más" };

export default function MorePage() {
  return <AdminSections current="/admin/mas" />;
}
