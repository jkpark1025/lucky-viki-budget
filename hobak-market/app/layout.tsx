import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "호박마켓 🎃",
  description: "동네 이웃과 함께하는 따뜻한 중고거래",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
