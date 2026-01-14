import { getPost } from '../../lib/db';
import { removePost, castVote } from '../../actions';
import { format } from 'date-fns';
import {
    ArrowLeft, Calendar,
    EyeOff, BarChart2
} from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function PostDetailPage({ params }: PageProps) {
    const { id } = await params;
    const post = await getPost(id);

    if (!post) {
        notFound();
    }

    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('user_session');
    let user = null;
    if (sessionCookie) {
        user = JSON.parse(sessionCookie.value);
    }

    const deleteAction = removePost.bind(null, id);

    // Helper for simple text parsing (mentions/hashtags)

    return (
        <article className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-8">
                <Link href="/" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors">
                    <ArrowLeft size={16} className="mr-1" />
                    Back to all posts
                </Link>
                {user && (user.id === post.author_id || user.role === 'admin') && (
                    <div className="flex items-center space-x-4">
                        <Link
                            href={`/posts/${id}/edit`}
                            className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors px-3 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                            Edit Post
                        </Link>
                        <form action={deleteAction}>
                            <button
                                type="submit"
                                className="text-sm font-medium text-red-500 hover:text-red-700 transition-colors px-3 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                                Delete Post
                            </button>
                        </form>
                    </div>
                )}
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                {/* Content Warning Logic would technically require Client Component for toggle state. 
            For now, we'll show CW banner and content below, or assume user wants to read it if they clicked 'Read More'. 
            Let's make it a detail section. */}

                <div className="p-8">
                    <header className="mb-6">
                        <div className="flex items-center space-x-4 text-sm text-slate-500 dark:text-slate-400 mb-4">
                            <span className="flex items-center">
                                <Calendar size={14} className="mr-1.5" />
                                {post.scheduled_at
                                    ? `Scheduled for ${format(new Date(post.scheduled_at), 'MMMM d, yyyy HH:mm')}`
                                    : format(new Date(post.created_at), 'MMMM d, yyyy')
                                }
                            </span>
                            {post.users?.name && (
                                <span className="flex items-center ml-3 pl-3 border-l border-slate-300 dark:border-slate-700">
                                    By {post.users.name}
                                </span>
                            )}
                            {post.cw && (
                                <span className="flex items-center text-red-500 font-medium bg-red-50 dark:bg-red-900/40 px-2 py-0.5 rounded-full text-xs">
                                    <EyeOff size={11} className="mr-1" /> CW: {post.cw}
                                </span>
                            )}
                        </div>

                        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-slate-100 leading-tight mb-6 text-balance">
                            {post.title}
                        </h1>
                    </header>
                    <div className="prose prose-slate dark:prose-invert max-w-none mb-8">
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                                h1: ({ node, ...props }) => <h2 className="text-2xl font-bold mt-8 mb-4 border-b pb-2 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white" {...props} />, // Map H1 to style
                                h2: ({ node, ...props }) => <h3 className="text-xl font-bold mt-6 mb-3 text-slate-900 dark:text-white" {...props} />,
                                p: ({ node, ...props }) => <p className="mb-4 text-lg leading-relaxed text-slate-800 dark:text-slate-300" {...props} />,
                                strong: ({ node, ...props }) => <strong className="font-bold text-slate-900 dark:text-white" {...props} />,
                                li: ({ node, ...props }) => <li className="text-slate-800 dark:text-slate-300 ml-4 list-disc" {...props} />,
                            }}
                        >
                            {post.content}
                        </ReactMarkdown>
                    </div>

                    {/* Attachments Grid */}
                    {post.attachments && post.attachments.length > 0 && (
                        <div className={`grid gap-4 mb-8 ${post.attachments.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                            {post.attachments.map((src, i) => (
                                <div key={i} className="rounded-xl overflow-hidden border border-slate-100 shadow-sm">
                                    <img src={src} alt={`Attachment ${i + 1}`} className="w-full h-auto object-contain bg-slate-50" />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Poll */}
                    {post.poll && (
                        <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                            <div className="flex items-center text-slate-900 font-bold mb-4">
                                <BarChart2 className="mr-2 text-blue-600" size={20} />
                                {post.poll.question}
                            </div>
                            <div className="space-y-3">
                                {post.poll.options.map((option, i) => {
                                    const totalVotes = post.poll!.options.reduce((acc, curr) => acc + curr.votes, 0);
                                    const percentage = totalVotes === 0 ? 0 : Math.round((option.votes / totalVotes) * 100);

                                    // Bind vote action
                                    const voteAction = castVote.bind(null, post.id, i);

                                    return (
                                        <form key={i} action={voteAction} className="relative">
                                            <button
                                                type="submit"
                                                className="w-full relative overflow-hidden rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors p-3 text-left group"
                                            >
                                                <div
                                                    className="absolute top-0 bottom-0 left-0 bg-blue-100/50 transition-all duration-500"
                                                    style={{ width: `${percentage}%` }}
                                                />
                                                <div className="relative flex justify-between items-center z-10">
                                                    <span className="font-medium text-slate-700">{option.text}</span>
                                                    <span className="text-sm text-slate-500 font-medium">
                                                        {percentage}% ({option.votes})
                                                    </span>
                                                </div>
                                            </button>
                                        </form>
                                    );
                                })}
                            </div>
                            <div className="mt-4 text-xs text-slate-400 text-right">
                                Total votes: {post.poll.options.reduce((acc, curr) => acc + curr.votes, 0)}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </article>
    );
}
