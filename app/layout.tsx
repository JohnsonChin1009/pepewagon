import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({weight: ["400", "500", "600", "700"], subsets: ["latin"]});


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
        className={`${poppins.className} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
