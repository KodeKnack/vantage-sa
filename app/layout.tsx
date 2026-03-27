import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./components/Navbar"; // ← relative, always works

export const metadata: Metadata = {
  title: "VantageSA — We validate CVs.",
  description: "Trust-Verification Engine for SA graduates.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#0d0d0d] antialiased">
        <Navbar />
        {children}
      </body>
    </html>
  );
}