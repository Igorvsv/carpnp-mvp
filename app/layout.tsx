import "./globals.css";
import type { Metadata } from "next";
import { Navbar } from "./components/Navbar";

export const metadata: Metadata = {
  title: "CarRental - Alugue carros por diária",
  description: "Marketplace de locação de carros entre pessoas",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <Navbar />
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
