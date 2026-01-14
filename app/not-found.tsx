import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4 animate-in fade-in zoom-in duration-300">
            <h1 className="text-4xl font-bold text-slate-800 mb-4">404</h1>
            <h2 className="text-2xl font-semibold text-slate-600 mb-6">Page Not Found</h2>
            <p className="text-slate-500 mb-8 max-w-md">
                The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
            </p>
            <Link href="/" className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors">
                <ArrowLeft size={18} className="mr-2" />
                Back to Home
            </Link>
        </div>
    );
}
