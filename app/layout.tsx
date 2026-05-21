import type { Metadata } from "next";
import { Young_Serif } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/authProvider";
import Navbar from "@/components/Navbar";

const youngSerif = Young_Serif({
  variable: "--font-young-serif",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "TravelPlanner",
  description: "Your Next Journey, Planned by AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${youngSerif.variable} h-full antialiased`}
    >
      <body className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <AuthProvider>
          <Navbar />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
