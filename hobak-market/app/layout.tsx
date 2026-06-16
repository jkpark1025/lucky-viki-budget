import type { Metadata, Viewport } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

export const metadata: Metadata = {
  title: "호박마켓 🎃",
  description: "동네 이웃과 함께하는 따뜻한 중고거래",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full">
      <body className="min-h-full flex flex-col">
        {/* 모바일 하단 nav 높이(64px)만큼 여백 확보 */}
        <div className="flex-1 flex flex-col pb-16 sm:pb-0">
          {children}
        </div>
        <BottomNav />
      </body>
    </html>
  );
}
