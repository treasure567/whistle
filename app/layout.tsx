import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import NextTopLoader from "nextjs-toploader";

import { SmoothScroll } from "@/components/providers/smooth-scroll";
import { Web3Provider } from "@/components/providers/web3";
import { ThemeProvider } from "@/components/providers/theme";
import { SimBackgroundProvider } from "@/components/providers/sim-background";
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

const SITE_URL = "https://whistle-agents.xyz";
const APP_NAME = "whistle — AI helpers for football";
const APP_DESCRIPTION =
  "Three AI helpers for World Cup matches. Emma saves great moments. Jack places bets. Tom picks your players. You fund who you trust — they do the work.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: APP_NAME,
    template: "%s · whistle",
  },
  description: APP_DESCRIPTION,
  keywords: [
    "World Cup",
    "AI football",
    "football bets",
    "pick players",
    "football highlights",
    "whistle",
  ],
  authors: [{ name: "whistle" }],
  creator: "whistle",
  publisher: "whistle",
  applicationName: "whistle",
  category: "DeFi",
  referrer: "origin-when-cross-origin",
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "whistle",
    title: APP_NAME,
    description: APP_DESCRIPTION,
    locale: "en_US",
    images: [
      {
        url: "/icon.svg",
        width: 512,
        height: 512,
        alt: "whistle — AI helpers for football",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: APP_NAME,
    description: APP_DESCRIPTION,
    images: ["/icon.svg"],
    creator: "@whistle_agents",
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
      name: "whistle",
      alternateName: "whistle Agents",
      url: SITE_URL,
      logo: `${SITE_URL}/icon.svg`,
      description:
        "AI helpers for live World Cup matches — Emma, Jack, and Tom act on your behalf.",
      foundingDate: "2026",
      sameAs: ["https://x.com/whistle_agents"],
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${SITE_URL}#software`,
      name: "whistle",
      applicationCategory: "SportsApplication",
      applicationSubCategory: "AI / Sports",
      operatingSystem: "Web",
      description:
        "Three AI helpers (Emma, Jack, Tom) for World Cup matches. Fund who you trust — they save moments, place bets, and pick players.",
      url: SITE_URL,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "OKB",
      },
      featureList: [
        "Three AI helpers: Emma, Jack, Tom",
        "Moment saving, match bets, and player picks",
        "Spending limits you control",
        "Public track records for every helper",
        "Works during live World Cup matches",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}#website`,
      url: SITE_URL,
      name: "whistle",
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
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} h-full antialiased`}
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
        <ThemeProvider>
          <Web3Provider>
            <SimBackgroundProvider>
              <SmoothScroll>{children}</SmoothScroll>
            </SimBackgroundProvider>
          </Web3Provider>
        </ThemeProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </body>
    </html>
  );
}
