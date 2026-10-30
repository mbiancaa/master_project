import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Analiză Fișiere Text",
  description: "Încarcă fișiere .txt pentru analiză",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ro">
      <body>{children}</body>
    </html>
  );
}
