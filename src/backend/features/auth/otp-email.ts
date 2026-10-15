export function otpEmailHtml(code: string, purpose: "signup" | "recovery") {
  const heading = purpose === "recovery" ? "Reset your password" : "Confirm your email";
  const body =
    purpose === "recovery"
      ? "Use this code on fyteAI to choose a new password. It expires in one hour."
      : "Use this code on fyteAI to finish creating your account. It expires in one hour.";

  return `<!doctype html>
<html>
  <body style="margin:0;background:#f9fafb;font-family:Montserrat,Arial,sans-serif;color:#282828;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f9fafb;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:440px;background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;padding:32px;">
            <tr>
              <td>
                <p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#6b7280;">fyteAI</p>
                <h1 style="margin:0 0 12px;font-size:24px;line-height:1.2;">${heading}</h1>
                <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#6b7280;">${body}</p>
                <p style="margin:0 0 24px;font-size:32px;letter-spacing:0.28em;font-weight:800;text-align:center;">${code}</p>
                <p style="margin:0;font-size:12px;line-height:1.6;color:#6b7280;">If you did not ask for this, ignore the email. Do not share the code.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
