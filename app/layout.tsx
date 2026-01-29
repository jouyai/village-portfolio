import type { Metadata } from "next";
import { Press_Start_2P } from "next/font/google"; 
import "./globals.css";

const pixelFont = Press_Start_2P({ 
  weight: "400", 
  subsets: ["latin"],
  variable: "--font-pixel", 
});

export const metadata: Metadata = {
  title: "Village",
  description: "Interactive RPG Portfolio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={pixelFont.className}>{children}</body>
    </html>
  );
}