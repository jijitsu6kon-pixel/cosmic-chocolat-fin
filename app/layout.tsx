import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  // 1. サイトの基本情報
  title: "COSMIC CHOCOLAT - 銀河の彼方へ想いを乗せて",
  description: "VOICE NOVA × COSMIC CHOCOLAT SYSTEM。クルーメイトにチョコレートを贈って想いを伝えよう！",
  
  // 2. OGP設定（SNSシェア時のカード表示）
  openGraph: {
    title: "COSMIC CHOCOLAT",
    description: "銀河の彼方へ想いを乗せて。VOICE NOVA特設サイト",
    url: "https://cosmic-chocolat-fin.vercel.app/",
    siteName: "COSMIC CHOCOLAT",
    images: [
      {
        url: "/og-image.png", // publicフォルダの画像を参照
        width: 1200,
        height: 630,
      },
    ],
    locale: "ja_JP",
    type: "website",
  },

  // 3. Twitter（X）用カード設定
  twitter: {
    card: "summary_large_image",
    title: "COSMIC CHOCOLAT",
    description: "銀河の彼方へ想いを乗せて。クルーメイトにチョコを贈ろう！",
    images: ["/og-image.png"],
  },
  
  // 4. ベースURL（画像のリンク切れを防ぐために必要）
  metadataBase: new URL("https://cosmic-chocolat-fin.vercel.app"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={inter.className}>{children}</body>
    </html>
  );
}