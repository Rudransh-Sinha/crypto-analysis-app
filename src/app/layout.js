import { Outfit } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata = {
  title: "CryptoSight AI - Advanced Chart Analysis",
  description: "AI-powered crypto technical analysis with strategy insights.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={outfit.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
