import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import NextTopLoader from "nextjs-toploader";

import { SmoothScroll } from "@/components/providers/smooth-scroll";
import { Web3Provider } from "@/components/providers/web3";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

const SITE_URL = "https://xdev-agents.xyz";
const APP_NAME = "xdev — AI Agent Stable";
const APP_DESCRIPTION =
  "Three onchain agents. Every World Cup match. Acting on X Layer. Scout mints the moments. Bookie takes the edge. Manager drafts the eleven. The user is the allocator, not the picker.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: APP_NAME,
    template: "%s · xdev",
  },
  description: APP_DESCRIPTION,
  keywords: [
    "X Layer",
    "OKX",
    "AI agents onchain",
    "World Cup onchain",
    "prediction agent",
    "fantasy onchain",
    "NFT moments",
    "session keys",
    "agent stable",
    "xdev",
  ],
  authors: [{ name: "xdev" }],
  creator: "xdev",
  publisher: "xdev",
  applicationName: "xdev",
  category: "DeFi",
  referrer: "origin-when-cross-origin",
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "xdev",
    title: APP_NAME,
    description: APP_DESCRIPTION,
    locale: "en_US",
    images: [
      {
        url: "/icon.svg",
        width: 512,
        height: 512,
        alt: "xdev — AI Agent Stable",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: APP_NAME,
    description: APP_DESCRIPTION,
    images: ["/icon.svg"],
    creator: "@xdev_agents",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export const viewport: Viewport = {
  themeColor: "#0A0A0A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}#organization`,
      name: "xdev",
      alternateName: "xdev Agents",
      url: SITE_URL,
      logo: `${SITE_URL}/icon.svg`,
      description:
        "AI Agent Stable for live sport on X Layer — three autonomous agents acting onchain across every World Cup match.",
      foundingDate: "2026",
      sameAs: ["https://x.com/xdev_agents"],
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${SITE_URL}#software`,
      name: "xdev Agent Stable",
      applicationCategory: "FinanceApplication",
      applicationSubCategory: "DeFi / AI Agent",
      operatingSystem: "Web",
      description:
        "Three autonomous onchain agents (Scout, Bookie, Manager) on X Layer mainnet. Allocate capital — agents act under bounded session keys, settled per match.",
      url: SITE_URL,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "OKB",
      },
      featureList: [
        "Three-agent stable: Scout, Bookie, Manager",
        "X Layer mainnet (OKX L2) onchain settlement",
        "Bounded session keys per match",
        "Public agent track records",
        "Licensing-clean fantasy: nation + jersey only",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}#website`,
      url: SITE_URL,
      name: "xdev",
      publisher: { "@id": `${SITE_URL}#organization` },
      inLanguage: "en-US",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <NextTopLoader
          color="#8B5CF6"
          height={2}
          showSpinner={false}
          shadow="0 0 12px #8B5CF6, 0 0 24px #8B5CF6"
          easing="cubic-bezier(0.4, 0, 0.2, 1)"
          speed={300}
        />
        <Web3Provider>
          <SmoothScroll>{children}</SmoothScroll>
        </Web3Provider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </body>
    </html>
  );
}
