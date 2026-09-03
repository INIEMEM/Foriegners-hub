import { createAdminClient } from "@/lib/supabase/admin";
import { processRentalReminders } from "@/lib/rental-reminders";

export const dynamic = "force-dynamic";

function isAuthorized(request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  return token === secret;
}

export async function GET(request) {
  if (!isAuthorized(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();
    const result = await processRentalReminders(supabase);
    return Response.json(result);
  } catch (err) {
    return Response.json(
      { error: err.message || "Reminder processing failed." },
      { status: 500 }
    );
  }
}
