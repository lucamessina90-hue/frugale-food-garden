import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Frugale Food Garden",
  description: "Prenota il tuo evento o sopralluogo giardinaggio",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
