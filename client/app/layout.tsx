import type { Metadata } from "next";
import "@/styles/globals.css";
import Navbar from "@/components/Navbar";



export const metadata: Metadata = {
  title: "Bio_Sign_Web",
  description: "Bio_Sign_App_analyses",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
        <body>
            <main className='app'>
                <Navbar></Navbar>
                {children}
            </main>
        </body>
    </html>
  );
}
