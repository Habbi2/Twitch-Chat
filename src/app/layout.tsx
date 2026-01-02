import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Habbi3 Chat Overlay - Neon Stream",
  description: "Neon-styled Twitch chat overlay for OBS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ background: 'transparent', margin: 0, overflow: 'hidden' }}>
        {children}
      </body>
    </html>
  );
}
