import type { Metadata } from "next";
import "./globals.css";
import { getServerSession } from "next-auth/next";
import "svgmap/dist/svgMap.min.css";
import SessionProvider from "@/utils/SessionProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Providers from "@/Providers";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const metadata: Metadata = {
  title: {
    default: "Singitronic — Modern Electronics & Marketplace",
    template: "%s | Singitronic",
  },
  description:
    "Shop flagship smartphones, laptops, cameras, audio gear, wearables, and smart home electronics with free express shipping and a 2-year warranty.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);
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
