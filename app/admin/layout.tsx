import Link from 'next/link';
import { createClient } from '../lib/supabase/server';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('user_session');
    let user = null;

    if (sessionCookie) {
        user = JSON.parse(sessionCookie.value);
    }

    if (!user || user.role !== 'admin') {
        redirect('/');
    }

    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
            <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 hidden md:block">
                <div className="p-6">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                        Admin Panel
                    </h2>
                </div>
                <nav className="px-4 space-y-2">
                    <Link
                        href="/admin/categories"
                        className="block px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium"
                    >
                        Categories
                    </Link>
                    <Link
                        href="/admin/posts"
                        className="block px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium"
                    >
                        Posts
                    </Link>
                    <Link
                        href="/settings"
                        className="block px-4 py-2 mt-8 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium"
                    >
                        Settings
                    </Link>
                </nav>
            </aside>
            <main className="flex-1 p-8 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
