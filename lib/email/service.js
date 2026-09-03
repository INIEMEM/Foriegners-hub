export function getSiteUrl() {
  const url = 
    process.env.NEXT_PUBLIC_SITE_URL || 
    process.env.SITE_URL || 
    (process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : "") || 
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") || 
    "http://localhost:3000";
    
  return url;
}

export function isEmailConfigured() {
  return Boolean(
    process.env.BREVO_API_KEY &&
      process.env.BREVO_SENDER_EMAIL &&
      process.env.BREVO_SENDER_NAME
  );
}

export async function sendEmail({ to, template, attachments = [] }) {
  if (!to || !template) {
    return { sent: false, skipped: true, reason: "missing_recipient_or_template" };
  }

  if (!isEmailConfigured()) {
    return { sent: false, skipped: true, reason: "email_not_configured" };
  }

  const payload = {
    sender: {
      name: process.env.BREVO_SENDER_NAME,
      email: process.env.BREVO_SENDER_EMAIL,
    },
    to: [{ email: to }],
    subject: template.subject,
    htmlContent: template.html,
    textContent: template.text,
  };

  if (attachments && attachments.length > 0) {
    payload.attachment = attachments;
  }

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "api-key": process.env.BREVO_API_KEY,
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    return { sent: false, skipped: false, reason: "brevo_request_failed" };
  }

  return { sent: true, skipped: false };
}

