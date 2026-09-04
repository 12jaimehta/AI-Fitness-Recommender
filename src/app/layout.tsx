import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@frontend/features/auth";
import { MotionProvider } from "@/components/shared/Motion";

export const metadata: Metadata = {
  title: "Fuel your training energy with AI",
  description: "Personalized AI-powered diet and workout plans tailored to your unique goals",
  icons: {
    icon: [{ url: "/images/favicon/favicon.png", type: "image/png" }],
    apple: "/images/favicon/favicon.png",
  },
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <MotionProvider>{children}</MotionProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
