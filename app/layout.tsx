import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "薯脑 — 把爆款博主的脑子，借你用一下",
  description: "输入你想对标的小红书博主，和 Ta 的 AI 分身对话，获取专属于你的定位、选题、诊断建议",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
