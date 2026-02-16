import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/layout/Navigation";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter"
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit"
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0a0f1a",
};

export const metadata: Metadata = {
  title: "VoiceLock",
  description: "Secure Voice Biometric Authentication - Your Voice is Your Key",
  keywords: ["voice authentication", "biometrics", "security", "voice recognition"],
  authors: [{ name: "VoiceLock" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "VoiceLock",
  },
  openGraph: {
    title: "VoiceLock",
    description: "Secure Voice Biometric Authentication",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${outfit.variable} font-sans antialiased overflow-x-hidden overflow-y-auto`}>

        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-[500px] bg-gradient-to-t from-accent/5 to-transparent" />
        </div>

        <main className="relative flex min-h-screen flex-col pb-20 md:pb-0 md:pt-20">
          {children}
        </main>

        <Navigation />
      </body>
    </html>
  );
}
