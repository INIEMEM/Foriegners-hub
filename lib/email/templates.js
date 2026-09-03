import { getSiteUrl } from "./service";

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

export function paymentSubmittedTemplate({ dashboardUrl }) {
  return baseTemplate({
    title: "Payment submitted",
    intro: "We received your payment confirmation.",
    body: "Your rental is waiting for Foreigners Hub admin verification. We will update your account once the payment has been reviewed.",
    actionLabel: "View dashboard",
    actionUrl: dashboardUrl,
  });
}

export function paymentVerifiedTemplate({ dashboardUrl }) {
  return baseTemplate({
    title: "Payment verified",
    intro: "Your payment has been confirmed.",
    body: "Your bike rental is now active. Please keep your expected return date in mind and contact Foreigners Hub if you need help.",
    actionLabel: "View dashboard",
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
