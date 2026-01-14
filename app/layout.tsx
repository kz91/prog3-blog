import './globals.css';
import { Navbar } from './components/Navbar';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Prog3 Blog',
    description: 'A simple blog built with Next.js',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className="dark">
            <body className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-grow w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                    {children}
                </main>
                <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 py-8 transition-colors">
                    <div className="max-w-4xl mx-auto px-4 text-center text-slate-500 dark:text-slate-400 text-sm">
                        &copy; {new Date().getFullYear()} kz91
                    </div>
                </footer>
            </body>
        </html>
    );
}
