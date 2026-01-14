import Link from 'next/link';
import React from 'react';
import MobileMenu from './MobileMenu';
import { logout } from '../auth/actions';
import { cookies } from 'next/headers';

export const Navbar = async () => {
    // Read session from cookies for Custom Auth
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('user_session');
    let user = null;

    if (sessionCookie) {
        try {
            user = JSON.parse(sessionCookie.value);
        } catch (e) {
            console.error('Error parsing session cookie', e);
        }
    }

    return (
        <nav className="bg-white dark:bg-slate-950 sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 transition-colors">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link href="/" className="text-xl font-bold text-[#fff] hover:opacity-80 transition-opacity">
                            MyBlogApp
                        </Link>
                    </div>
                    {/* Home link removed as requested/implied redundancy */}
                    {user ? (
                        <div className="flex items-center">
                            {/* Desktop Links */}
                            <div className="hidden md:flex items-center space-x-6">
                                <Link href="/posts/create" className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
                                    New Post
                                </Link>
                                <Link href={user.role === 'admin' ? '/admin/posts' : '/posts'} className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
                                    Home
                                </Link>
                                <form action={logout}>
                                    <button className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                                        Logout
                                    </button>
                                </form>
                            </div>

                            {/* Mobile Menu Trigger */}
                            <MobileMenu user={user} />
                        </div>
                    ) : (
                        <div className="flex items-center space-x-6">
                            <Link href="/signup" className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                Sign Up
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};
