import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Fraunces, Manrope } from "next/font/google";
import { MotionProvider } from "@/components/motion/provider";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  axes: ["SOFT", "opsz"],
  style: ["normal", "italic"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const sans = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "7270020 Canada Ltd. | Event Planning and Arrangement",
    template: "%s | 7270020 Canada Ltd.",
  },
  description:
    "Event planning and arrangement for weddings, corporate events, cultural celebrations, private functions and gatherings of every size.",
  openGraph: {
    type: "website",
    siteName: "7270020 Canada Ltd.",
    locale: "en_CA",
    images: [{ url: "/images/event-wedding-ballroom.jpg", width: 1536, height: 1024, alt: "Wedding reception with blush flowers and candlelit dining tables" }],
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#1e0a2e",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-CA" className={`${display.variable} ${sans.variable} ${cormorant.variable}`}>
      <body>
        <noscript>
          <style>{`[data-reveal],[data-reveal] *{opacity:1!important;transform:none!important;clip-path:none!important}`}</style>
        </noscript>
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
