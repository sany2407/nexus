import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ABIELAN NEXUS — One Connected Restaurant Ecosystem",
  description:
    "A live business ecosystem map connecting every department of the Abielan HoReCa restaurant management platform.",
  applicationName: "Abielan Nexus",
  icons: {
    icon: "/assets/abielan-logo.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#080A0E",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
