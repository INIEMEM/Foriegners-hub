import { getSiteUrl } from "./service.js";

const brandFooter =
  "Foreigners Hub keeps bike and apartment rentals simple for students.";

function baseTemplate({ title, intro, body, actionLabel, actionUrl }) {
  const siteUrl = getSiteUrl();
  return {
    subject: title,
    html: `
      <div style="font-family:Arial,sans-serif;color:#0f172a;line-height:1.6;max-width:620px;margin:0 auto;padding:24px">
        <div style="margin-bottom:24px">
          <img src="${siteUrl}/logo.jpg" alt="Foreigners Hub Logo" width="140" height="45" style="display:block;max-width:140px;" />
        </div>
        <h1 style="font-size:24px;line-height:1.25;margin:0 0 12px">${title}</h1>
        <p style="font-size:15px;color:#475569;margin:0 0 18px">${intro}</p>
        <div style="font-size:14px;color:#334155">${body}</div>
        ${
          actionLabel && actionUrl
            ? `<p style="margin:28px 0"><a href="${actionUrl}" style="background:#315CFF;color:white;text-decoration:none;border-radius:10px;padding:12px 18px;font-weight:700">${actionLabel}</a></p>`
            : ""
        }
        <p style="border-top:1px solid #e2e8f0;margin-top:28px;padding-top:16px;font-size:12px;color:#64748b">${brandFooter}</p>
      </div>
    `,
    text: `${title}\n\n${intro}\n\n${body.replace(/<[^>]*>/g, "")}\n\n${brandFooter}`,
  };
}

// ── Existing templates ────────────────────────────────────────────────────────

export function paymentSubmittedTemplate({ dashboardUrl }) {
  return baseTemplate({
    title: "Payment submitted — we're on it",
    intro: "We received your payment confirmation.",
    body: "Your rental is currently awaiting verification from our team. You'll receive another email as soon as it's confirmed. This usually takes a few hours.",
    actionLabel: "View your dashboard",
    actionUrl: dashboardUrl,
  });
}

export function paymentVerifiedTemplate({ dashboardUrl }) {
  return baseTemplate({
    title: "Payment confirmed ✓",
    intro: "Great news — your payment has been verified by our team.",
    body: "A bike is being assigned to you. You'll receive another email shortly with your pickup time and location. Once your bike is assigned, you'll also be able to sign your rental contract on your dashboard.",
    actionLabel: "View your dashboard",
    actionUrl: dashboardUrl,
  });
}

export function paymentRejectedTemplate({ dashboardUrl, reason }) {
  return baseTemplate({
    title: "Payment could not be verified",
    intro: "Your submitted payment needs attention.",
    body: reason
      ? `Reason provided by Foreigners Hub: ${reason}`
      : "Please contact Foreigners Hub support or submit corrected payment details.",
    actionLabel: "View dashboard",
    actionUrl: dashboardUrl,
  });
}

export function rentalReminderTemplate({ dashboardUrl, title, message }) {
  return baseTemplate({
    title,
    intro: message,
    body: "Please review your dashboard for rental details and return instructions.",
    actionLabel: "View dashboard",
    actionUrl: dashboardUrl,
  });
}

export function rentalConfirmedTemplate({ dashboardUrl }) {
  return baseTemplate({
    title: "Rental confirmed",
    intro: "Your bike rental has been confirmed.",
    body: "Your rental details, contract, dates, and payment history are available from your dashboard.",
    actionLabel: "View dashboard",
    actionUrl: dashboardUrl,
  });
}

// ── New templates ─────────────────────────────────────────────────────────────

export function bikeAssignedTemplate({ dashboardUrl, pickupDate, pickupLocation, bikeCode }) {
  return baseTemplate({
    title: "Your bike is ready for pickup 🚲",
    intro: "Your payment has been confirmed and a bike has been assigned to you.",
    body: `
      <p>Here are your pickup details:</p>
      <table style="width:100%;border-collapse:collapse;margin:12px 0;font-size:14px">
        ${bikeCode ? `<tr><td style="padding:8px 0;color:#64748b;width:40%">Bike code</td><td style="padding:8px 0;font-weight:600">${bikeCode}</td></tr>` : ""}
        ${pickupDate ? `<tr><td style="padding:8px 0;color:#64748b">Pickup time</td><td style="padding:8px 0;font-weight:600">${pickupDate}</td></tr>` : ""}
        ${pickupLocation ? `<tr><td style="padding:8px 0;color:#64748b">Location</td><td style="padding:8px 0;font-weight:600">${pickupLocation}</td></tr>` : ""}
      </table>
      <p style="margin-top:12px">Before you pick up your bike, please <strong>sign your rental contract</strong> on your dashboard. You won't be able to collect the bike until the contract is signed.</p>
    `,
    actionLabel: "Go to dashboard to sign contract",
    actionUrl: dashboardUrl,
  });
}

export function contractSignedTemplate({ dashboardUrl, pdfUrl }) {
  return baseTemplate({
    title: "Your signed rental contract",
    intro: "Thanks for signing your rental contract.",
    body: pdfUrl
      ? `<p>Your signed contract is available for download: <a href="${pdfUrl}" style="color:#315CFF;font-weight:600">Download PDF</a></p><p>Keep this for your records.</p>`
      : "<p>Your signed contract is saved on your dashboard. You can download a copy at any time.</p>",
    actionLabel: "View your dashboard",
    actionUrl: dashboardUrl,
  });
}

export function rentalStartedTemplate({ dashboardUrl, endDate }) {
  return baseTemplate({
    title: "Your rental is now active 🎉",
    intro: "Everything is in order — enjoy your ride!",
    body: `
      <p>Your bike rental is officially active.</p>
      ${endDate ? `<p>Your rental period ends on <strong>${endDate}</strong>. If you'd like to extend, you can do so from your dashboard before this date.</p>` : ""}
      <p>If you have any issues with your bike, please use the repair request form on your dashboard and our team will assist you promptly.</p>
    `,
    actionLabel: "View your dashboard",
    actionUrl: dashboardUrl,
  });
}

export function rentalExpiringTemplate({ dashboardUrl, endDate }) {
  return baseTemplate({
    title: "Your rental ends soon",
    intro: `Your current bike rental is ending on ${endDate}.`,
    body: `
      <p>If you'd like to continue riding, you can extend your rental from your dashboard:</p>
      <ul style="margin:8px 0;padding-left:20px">
        <li><strong>1 extra week</strong> — €55</li>
        <li><strong>1 extra month</strong> — €170</li>
      </ul>
      <p>If you don't extend, please ensure the bike is returned in good condition on or before the end date.</p>
    `,
    actionLabel: "Extend my rental",
    actionUrl: dashboardUrl,
  });
}

export function rentalExpiredTemplate({ dashboardUrl }) {
  return baseTemplate({
    title: "Your rental has ended",
    intro: "Your bike rental period is now complete.",
    body: `
      <p>Thank you for riding with Foreigners Hub!</p>
      <p>If you still have the bike, please return it as soon as possible. Your €50 refundable deposit will be processed once the bike has been returned in good condition.</p>
      <p>We hope to see you again soon. You can start a new rental anytime from your dashboard.</p>
    `,
    actionLabel: "View your dashboard",
    actionUrl: dashboardUrl,
  });
}

export function extensionPaymentSubmittedTemplate({ dashboardUrl }) {
  return baseTemplate({
    title: "Extension payment submitted",
    intro: "We've received your extension payment confirmation.",
    body: "Our team will verify it shortly. Once confirmed, your rental end date will be updated automatically. You'll receive another email when the extension is activated.",
    actionLabel: "View your dashboard",
    actionUrl: dashboardUrl,
  });
}

// ── Repair templates (existing) ────────────────────────────────────────────────

const repairStatusMessages = {
  IN_PROGRESS: {
    intro: "Good news — your repair request is being worked on.",
    body: "Our team has started working on your bike. We will notify you again when the repair is complete.",
  },
  COMPLETED: {
    intro: "Your bike repair has been completed.",
    body: "Your bike is ready. Please contact Foreigners Hub to arrange collection or drop-off. Check your dashboard for full details.",
  },
  CANCELLED: {
    intro: "Your repair request has been cancelled.",
    body: "If you still need a repair, you can submit a new request from your dashboard. Contact us if you have questions.",
  },
  PENDING: {
    intro: "Your repair request has been updated.",
    body: "Your request is back in the queue. Our team will be in touch shortly.",
  },
};

export function repairStatusUpdatedTemplate({ dashboardUrl, status, serviceName }) {
  const { intro, body } = repairStatusMessages[status] || repairStatusMessages.PENDING;
  const statusLabel = status.replace("_", " ");
  return baseTemplate({
    title: `Repair update: ${serviceName || "your request"} is now ${statusLabel}`,
    intro,
    body,
    actionLabel: "View dashboard",
    actionUrl: dashboardUrl,
  });
}

// ── Rental Request Admin Notification ──────────────────────────────────────────

export function rentalRequestAdminNotificationTemplate({
  guestName,
  guestPhone,
  planLabel,
  startDate,
  bikeName,
  adminUrl,
}) {
  const siteUrl = getSiteUrl();
  const targetUrl = adminUrl || `${siteUrl}/admin`;
  const cleanPhone = (guestPhone || "").replace(/\D/g, "");
  const waLink = cleanPhone ? `https://wa.me/${cleanPhone}` : "";

  return baseTemplate({
    title: `🚲 New Rental Request: ${guestName}`,
    intro: "A prospective customer just requested a bike rental on Foreigners Hub.",
    body: `
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px;margin:16px 0;">
        <table style="width:100%;border-collapse:collapse;font-size:14px;color:#1e293b;">
          <tr>
            <td style="padding:6px 0;font-weight:700;color:#64748b;width:35%;">Customer Name:</td>
            <td style="padding:6px 0;font-weight:700;color:#0f172a;">${guestName}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;font-weight:700;color:#64748b;">Phone Number:</td>
            <td style="padding:6px 0;font-weight:700;color:#0f172a;">
              <a href="tel:${guestPhone}" style="color:#315cff;text-decoration:none;">${guestPhone}</a>
              ${waLink ? ` &nbsp;·&nbsp; <a href="${waLink}" style="color:#16a34a;text-decoration:none;font-weight:700;">Chat on WhatsApp ↗</a>` : ""}
            </td>
          </tr>
          <tr>
            <td style="padding:6px 0;font-weight:700;color:#64748b;">Payment Plan:</td>
            <td style="padding:6px 0;font-weight:600;color:#0f172a;">${planLabel}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;font-weight:700;color:#64748b;">Preferred Start Date:</td>
            <td style="padding:6px 0;font-weight:600;color:#0f172a;">${startDate || "Today"}</td>
          </tr>
          ${bikeName ? `
          <tr>
            <td style="padding:6px 0;font-weight:700;color:#64748b;">Requested Bike:</td>
            <td style="padding:6px 0;font-weight:600;color:#0f172a;">${bikeName}</td>
          </tr>` : ""}
        </table>
      </div>
      <p style="margin-top:14px;font-size:13px;color:#64748b;">
        Reach out to the customer to qualify their request and coordinate meeting at the office to create their account and issue the bike.
      </p>
    `,
    actionLabel: "View in Admin Dashboard →",
    actionUrl: targetUrl,
  });
}
