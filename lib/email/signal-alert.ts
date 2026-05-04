import "server-only";
import { Resend } from "resend";

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  return new Resend(process.env.RESEND_API_KEY);
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function sendSignalAlertEmail(params: {
  to: string;
  userName: string;
  title: string;
  body: string;
  signalHeadline: string;
  signalUrl: string;
  appUrl: string;
}): Promise<boolean> {
  const resend = getResend();
  if (!resend) return false;

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>${escapeHtml(params.title)}</title></head>
<body style="background:#09090b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;margin:0;padding:36px 18px;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;">
    <tr><td>
      <p style="color:#60a5fa;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;margin:0 0 18px;">
        Trajectory.io · Signal Alert
      </p>
      <h1 style="color:#f4f4f5;font-size:22px;line-height:1.2;margin:0 0 12px;">
        ${escapeHtml(params.title)}
      </h1>
      <p style="color:#d4d4d8;font-size:14px;line-height:1.55;margin:0 0 22px;">
        ${escapeHtml(params.body)}
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#18181b;border:1px solid #27272a;border-radius:8px;margin-bottom:24px;">
        <tr><td style="padding:18px;">
          <p style="color:#71717a;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;margin:0 0 8px;">Matched Signal</p>
          <p style="color:#f4f4f5;font-size:14px;line-height:1.45;margin:0;">${escapeHtml(params.signalHeadline)}</p>
        </td></tr>
      </table>
      <a href="${params.appUrl}/dashboard" style="display:block;background:#60a5fa;color:#020617;text-align:center;padding:13px;border-radius:6px;font-weight:700;font-size:14px;text-decoration:none;margin-bottom:12px;">
        Open dashboard
      </a>
      <a href="${params.signalUrl}" style="display:block;color:#a1a1aa;text-align:center;font-size:12px;text-decoration:none;">
        View source signal
      </a>
    </td></tr>
  </table>
</body>
</html>`;

  try {
    await resend.emails.send({
      from: "Trajectory.io <onboarding@resend.dev>",
      to: params.to,
      subject: params.title,
      html,
    });
    return true;
  } catch (error) {
    console.error("[signal-alert-email]", error);
    return false;
  }
}
