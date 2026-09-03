import { getSiteUrl, sendEmail } from "@/lib/email/service";
import { rentalReminderTemplate } from "@/lib/email/templates";

function daysUntil(dateValue, now = new Date()) {
  const dueDate = new Date(dateValue);
  return Math.ceil((dueDate.getTime() - now.getTime()) / 86400000);
}

function reminderForRental(rental, now = new Date()) {
  if (!rental.end_date || rental.status !== "ACTIVE") return null;

  const days = daysUntil(rental.end_date, now);

  if (days === 3) {
    return {
      type: "due_3_days",
      title: "Rental due in 3 days",
      message: "Your bike rental is due in 3 days. Please prepare to return the bike or request support if needed.",
    };
  }

  if (days === 1) {
    return {
      type: "due_1_day",
      title: "Rental due tomorrow",
      message: "Your bike rental is due tomorrow. Please prepare the bike for return.",
    };
  }

  if (days === 0) {
    return {
      type: "due_today",
      title: "Rental due today",
      message: "Your bike rental is due today. Please return the bike as agreed.",
    };
  }

  if (days < 0) {
    const overdueDays = Math.abs(days);
    return {
      type: overdueDays >= 5 ? "overdue_5_days" : `overdue_${overdueDays}_days`,
      title: overdueDays >= 5 ? "Bike return required" : "Rental overdue",
      message:
        overdueDays >= 5
          ? "Your bike rental is approximately five days overdue. Please return the bike to Foreigners Hub as soon as possible."
          : "Your bike rental is overdue. Please return the bike or contact Foreigners Hub immediately.",
    };
  }

  return null;
}

export async function processRentalReminders(supabase, now = new Date()) {
  const { data: rentals, error } = await supabase
    .from("rentals")
    .select(`
      id,
      user_id,
      end_date,
      status,
      profiles(email),
      bikes(name, b_code)
    `)
    .eq("status", "ACTIVE")
    .not("bike_id", "is", null);

  if (error) {
    throw new Error("Could not load active rentals for reminders.");
  }

  const results = [];
  const dashboardUrl = `${getSiteUrl()}/dashboard`;

  for (const rental of rentals || []) {
    const reminder = reminderForRental(rental, now);
    if (!reminder) continue;

    const { error: eventError } = await supabase
      .from("rental_notification_events")
      .insert({
        rental_id: rental.id,
        user_id: rental.user_id,
        event_type: reminder.type,
      });

    if (eventError) {
      results.push({ rentalId: rental.id, eventType: reminder.type, skipped: true });
      continue;
    }

    await supabase.from("notifications").insert({
      user_id: rental.user_id,
      title: reminder.title,
      message: reminder.message,
    });

    const emailResult = await sendEmail({
      to: rental.profiles?.email,
      template: rentalReminderTemplate({
        dashboardUrl,
        title: reminder.title,
        message: reminder.message,
      }),
    });

    results.push({
      rentalId: rental.id,
      eventType: reminder.type,
      notified: true,
      email: emailResult,
    });
  }

  return {
    processed: results.length,
    results,
  };
}
