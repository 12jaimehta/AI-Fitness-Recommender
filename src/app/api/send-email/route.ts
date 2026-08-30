import { sendEmail } from "@backend/features/send-email";
import { jsonError, jsonOk, readJsonBody } from "@backend/shared";

export async function POST(request: Request) {
  try {
    const body = (await readJsonBody(request)) as {
      to: string;
      subject: string;
      html: string;
    };
    const result = await sendEmail(body);
    return jsonOk(result);
  } catch (error) {
    return jsonError(error);
  }
}
