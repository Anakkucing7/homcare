import type { Metadata } from "next";
import { RouteScrollReset } from "../components/route-scroll-reset";
import "./globals.css";

export const metadata: Metadata = {
  title: "Layanan Homecare | Perawatan nyaman dari rumah",
  description: "Layanan perawatan homecare di rumah, kantor, dan lokasi Anda di Jabodetabek.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body><RouteScrollReset />{children}</body>
    </html>
  );
}
