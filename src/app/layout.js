// app/layout.js
import "./globals.css";
import { Inter } from "next/font/google";
import { Providers } from "@/components/providers"; // Yeni oluşturduğumuz provider

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "SuiPATH",
  description: "Sui Blockchain Event Platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Tüm uygulamayı Provider ile sarıyoruz */}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
