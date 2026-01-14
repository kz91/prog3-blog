'use server'

import Link from 'next/link';
import { createClient } from '../../lib/supabase/server';
import { revalidatePath } from 'next/cache';

import { getPosts } from '../../lib/db';

async function deletePost(id: string) {
    'use server'
    const supabase = await createClient()
    await supabase.from('posts').delete().eq('id', id)
    revalidatePath('/admin/posts')
}

interface AdminPostsPageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AdminPostsPage({ searchParams }: AdminPostsPageProps) {
    const params = await searchParams;
    const categoryId = typeof params.categoryId === 'string' ? params.categoryId : undefined;
    const posts = await getPosts(categoryId);

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Posts</h1>
                <Link
                    href="/posts/create"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                    Create New
                </Link>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800/50">
                        <tr>
                            <th className="px-6 py-3 text-sm font-semibold text-slate-500 dark:text-slate-400">Title</th>
                            <th className="px-6 py-3 text-sm font-semibold text-slate-500 dark:text-slate-400">Status</th>
                            <th className="px-6 py-3 text-sm font-semibold text-slate-500 dark:text-slate-400">User</th>
                            <th className="px-6 py-3 text-sm font-semibold text-slate-500 dark:text-slate-400">Date</th>
                            <th className="px-6 py-3 text-sm font-semibold text-slate-500 dark:text-slate-400 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        {posts?.map((post) => (
                            <tr key={post.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100 max-w-xs truncate">
                                    <Link href={`/posts/${post.id}`} className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors block truncate">
                                        {post.title}
                                    </Link>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${post.published
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                        }`}>
                                        {post.published ? 'Published' : 'Draft'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-sm">
                                    {post.users?.name || 'Unknown'}
                                </td>
                                <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-sm">
                                    {new Date(post.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-right space-x-4">
                                    <Link
                                        href={`/admin/posts/${post.id}/edit`}
                                        className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                                    >
                                        Edit
                                    </Link>
                                    <form action={deletePost.bind(null, post.id)} className="inline">
                                        <button className="text-sm font-medium text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors">
                                            Delete
                                        </button>
                                    </form>
                                </td>
                            </tr>
                        ))}
                        {posts?.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                                    No posts found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
