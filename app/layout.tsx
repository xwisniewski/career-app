import type { Metadata } from "next";
import { Geist, Geist_Mono, IBM_Plex_Mono, Instrument_Serif } from "next/font/google";
import AppSessionProvider from "@/components/session-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Trajectory.io",
  description: "Macro-grounded career guidance personalized to your profile",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${plexMono.variable} ${instrumentSerif.variable} font-sans`}
      >
        <AppSessionProvider>{children}</AppSessionProvider>
      </body>
    </html>
  );
}
