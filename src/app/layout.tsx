import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ReactNode } from 'react';
import ClientLayout from './ClientLayout';
import AuthProvider from "@/components/providers/AuthProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Dynasty 8",
    description: "Votre rêve, notre objectif",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
    return (
        <html lang="fr" className="dark h-full w-full">
        <body className={`${inter.className} h-full w-full`}>
        <AuthProvider>
            <ClientLayout>
                <main className="h-full w-full">
                    {children}
                </main>
            </ClientLayout>
        </AuthProvider>
        </body>
        </html>
    );
}