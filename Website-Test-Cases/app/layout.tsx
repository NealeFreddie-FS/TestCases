import "./globals.css";
import type { Metadata } from "next";
import { Inter, Cinzel } from "next/font/google";
import Navigation from "./components/Navigation";
import AdminPanel from "./components/AdminPanel";
import LayoutClientWrapper from "./components/layout/LayoutClientWrapper";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Fantasy Feedback Kingdom",
  description:
    "A magical realm where feedback is gathered through epic quests and mystical forms",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${cinzel.variable} font-sans min-h-screen`}
      >
        <LayoutClientWrapper>{children}</LayoutClientWrapper>
      </body>
    </html>
  );
}
