import type { Metadata } from "next";
import { Anton_SC } from "next/font/google";
import "./globals.css";

const anton = Anton_SC({weight: ["400"], subsets: ["latin"]});


export const metadata: Metadata = {
  title: "pepewagon",
  description: "Empowering users to capture and train street data while earning rewards",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${anton.className} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
