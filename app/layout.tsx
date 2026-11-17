import type { Metadata } from "next";
import "./globals.css";
import { getServerSession } from "next-auth/next";
import SessionProvider from "@/utils/SessionProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Providers from "@/Providers";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const metadata: Metadata = {
  title: {
    default: "Singitronic — Everyday Home, Lifestyle & Tech Marketplace",
    template: "%s | Singitronic",
  },
  description:
    "Shop trusted home appliances, smartphones, laptops, cameras, audio, and thoughtful gifts with free delivery over $150, easy 30-day returns, and a 2-year warranty.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let session = null;
  try {
    session = await getServerSession(authOptions);
  } catch {
    session = null;
  }
  return (
    <html lang="en" data-theme="light">
      <body className="min-h-screen flex flex-col bg-canvas text-stone-900 antialiased">
        <SessionProvider session={session}>
          <Header />
          <Providers>
            <main className="flex-1">{children}</main>
          </Providers>
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}
