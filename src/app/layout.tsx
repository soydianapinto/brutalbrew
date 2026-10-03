import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "brutal brew",
  description: "tu dosis. sin filtros.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
