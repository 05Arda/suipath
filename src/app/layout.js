// app/layout.js
import "./globals.css";
import { Inter } from "next/font/google";
import { Providers } from "@/components/providers"; // Yeni oluşturduğumuz provider

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Trace",
  description: "Sui Blockchain Event Platform",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "32x32" },
      { url: "/tracelogo.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className + " bg-deep-bg text-white"}>
        {/* Tüm uygulamayı Provider ile sarıyoruz */}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
