import { redirect } from "next/navigation";

// The tournaments are the admin's main screen.
export default function AdminHome() {
  redirect("/admin/torneos");
}
