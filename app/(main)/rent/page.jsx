import { redirect } from "next/navigation";

// /rent redirects to /rent/request — the actual rental flow page
export default function RentIndexPage() {
  redirect("/rent/request");
}
