const RESEND_API = "https://api.resend.com/emails";

export async function sendEmail(options: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ sent: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from =
    process.env.EMAIL_FROM ?? "FinanceTracker <onboarding@resend.dev>";

  if (!apiKey) {
    if (process.env.NODE_ENV !== "production") {
      console.info("[FinanceTracker] Email (no RESEND_API_KEY):", options);
    }
    return { sent: false, error: "Email not configured" };
  }

  const res = await fetch(RESEND_API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [options.to],
      subject: options.subject,
      html: options.html,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    return { sent: false, error: text };
  }

  return { sent: true };
}

export function passwordResetEmailHtml(resetUrl: string): string {
  return `
    <p>You requested a password reset for FinanceTracker.</p>
    <p><a href="${resetUrl}">Reset your password</a></p>
    <p>This link expires in 1 hour. If you did not request this, ignore this email.</p>
  `;
}

export function billReminderEmailHtml(
  lines: { name: string; amount: string; due: string }[],
): string {
  const items = lines
    .map((l) => `<li><strong>${l.name}</strong> — ${l.amount} (due ${l.due})</li>`)
    .join("");
  return `
    <p>Bills due in the next few days:</p>
    <ul>${items}</ul>
    <p><a href="${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/dashboard">Open FinanceTracker</a></p>
  `;
}
