import type { Metadata } from "next";
import { Share_Tech_Mono, JetBrains_Mono } from "next/font/google";
import { Web3Provider } from "@/components/providers/Web3Provider";
import "./globals.css";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://infinite-ponzi-glitch.vercel.app";

const shareTech = Share_Tech_Mono({
  variable: "--font-share-tech",
  subsets: ["latin"],
  weight: "400",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: "Infinite Ponzi Glitch — Create. Earn. Repeat.",
  description:
    "Glitched terminal AttentionFi on Robinhood Chain mainnet. Inject quests. Hack the leaderboard. Extract the airdrop.",
  icons: {
    icon: [{ url: "/logo.png", sizes: "512x512", type: "image/png" }],
    apple: [{ url: "/apple-icon.png", sizes: "192x192", type: "image/png" }],
  },
  openGraph: {
    title: "Infinite Ponzi Glitch",
    description: ">> SYSTEM BREACH :: ATTENTION_FI MODULE ACTIVE ON CHAIN 4663",
    images: [
      {
        url: "/banner-twitter.png",
        width: 1500,
        height: 500,
        alt: "Infinite Ponzi Glitch — AttentionFi on Robinhood Chain",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Infinite Ponzi Glitch",
    description: ">> SYSTEM BREACH :: ATTENTION_FI MODULE ACTIVE ON CHAIN 4663",
    images: ["/banner-twitter.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${shareTech.variable} ${jetbrainsMono.variable} h-full`}>
      <body className="min-h-full flex flex-col font-mono antialiased">
        <Web3Provider>{children}</Web3Provider>
      </body>
    </html>
  );
}
