import type { Metadata } from "next";
import "@/styles/globals.css";
import Navbar from "@/components/Navbar";
import { DataProvider } from "@/context/DataContext";



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
                  <DataProvider>
                    {children}
                  </DataProvider>
            </main>
        </body>
    </html>
  );
}