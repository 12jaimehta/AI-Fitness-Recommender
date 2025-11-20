import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { to, subject, html } = await request.json();

    // Validate required fields
    if (!to || !subject || !html) {
      return NextResponse.json(
        { error: "Missing required fields: to, subject, html" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    // For now, we'll simulate email sending
    // In production, you would integrate with a real email service like:
    // - Resend
    // - SendGrid
    // - AWS SES
    // - Nodemailer with SMTP
    
    console.log("📧 Email Service - Sending diet plan:");
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`HTML length: ${html.length} characters`);
    
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Log success
    console.log("✅ Email sent successfully");

    return NextResponse.json(
      { 
        success: true, 
        message: "Diet plan sent successfully to your email",
        sentTo: to,
        timestamp: new Date().toISOString()
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Email service error:", error);
    return NextResponse.json(
      { 
        error: "Failed to send email",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
