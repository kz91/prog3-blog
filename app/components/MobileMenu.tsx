'use client';

import { Menu, X, Plus, Home, LogOut, Settings, List } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { logout } from '../auth/actions';

interface MobileMenuProps {
    user: any;
}

export default function MobileMenu({ user }: MobileMenuProps) {
    const [isOpen, setIsOpen] = useState(false);

    if (!user) return null;

    const toggleMenu = () => setIsOpen(!isOpen);

    return (
        <div className="md:hidden fixed bottom-6 right-6 z-50">
            {/* Backdrop for closing menu when open */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Menu Items (Slide up animation) */}
            <div className={`absolute bottom-16 right-0 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-all duration-300 origin-bottom-right z-50 ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}>
                <div className="p-2 space-y-1">
                    <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Menu
                    </div>

                    <Link
                        href="/posts/create"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <Plus size={18} className="mr-3 text-blue-500" />
                        New Post
                    </Link>

                    <Link
                        href={user.role === 'admin' ? '/admin/posts' : '/posts'}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <Home size={18} className="mr-3 text-slate-500" />
                        Home
                    </Link>

                    <div className="my-1 border-t border-slate-100 dark:border-slate-800"></div>

                    {user.role === 'admin' ? (
                        <>
                            <Link
                                href="/admin/categories"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                <List size={18} className="mr-3 text-slate-500" />
                                Categories
                            </Link>
                            <Link
                                href="/admin/posts"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                <List size={18} className="mr-3 text-slate-500" />
                                All Posts
                            </Link>
                        </>
                    ) : (
                        <Link
                            href="/posts"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <List size={18} className="mr-3 text-slate-500" />
                            My Posts
                        </Link>
                    )}

                    <Link
                        href="/settings"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <Settings size={18} className="mr-3 text-slate-500" />
                        Settings
                    </Link>

                    <div className="my-1 border-t border-slate-100 dark:border-slate-800"></div>

                    <form action={logout} className="w-full">
                        <button className="flex w-full items-center px-3 py-2 text-sm font-medium rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                            <LogOut size={18} className="mr-3" />
                            Logout
                        </button>
                    </form>
                </div>
            </div>

            {/* Float Button */}
            <button
                onClick={toggleMenu}
                className="flex items-center justify-center w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:ring-offset-slate-900"
                aria-label="Toggle Menu"
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
        </div>
    );
}
