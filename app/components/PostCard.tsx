'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import type { Post } from '../lib/types';
import { Calendar, ArrowRight, EyeOff, Eye, Image as ImageIcon, BarChart2 } from 'lucide-react';

interface PostCardProps {
    post: Post;
}

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
    const [isRevealed, setIsRevealed] = useState(false);
    const hasAttachments = post.attachments && post.attachments.length > 0;
    const hasPoll = post.poll && post.poll.options.length > 0;
    const isScheduled = post.scheduled_at && new Date(post.scheduled_at) > new Date();

    // If CW present, use it as initial content
    const displayContent = post.content.replace(/[#*`_]/g, '');
    const summary = post.cw || displayContent.slice(0, 120) + (displayContent.length > 120 ? '...' : '');

    return (
        <article className={`bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-md transition-shadow duration-300 flex flex-col h-full ${isScheduled ? 'opacity-75 border-yellow-200 dark:border-yellow-900 bg-yellow-50/30 dark:bg-yellow-900/10' : ''}`}>

            {/* CW Header / Status Bar */}
            {(post.cw || isScheduled) && (
                <div className="px-4 py-2 bg-slate-50 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
                    {post.cw && (
                        <span className="flex items-center text-red-500 dark:text-red-400">
                            <EyeOff size={12} className="mr-1" /> Content Warning
                        </span>
                    )}
                    {isScheduled && (
                        <span className="flex items-center text-yellow-600 dark:text-yellow-500">
                            <Calendar size={12} className="mr-1" /> Scheduled
                        </span>
                    )}
                </div>
            )}

            {/* Attachments Preview (Thumbnail) */}
            {hasAttachments && !post.cw && (
                <div className="h-48 overflow-hidden bg-slate-100 dark:bg-slate-800 relative group">
                    <img
                        src={post.attachments![0]}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                        loading="lazy"
                    />
                    {post.attachments!.length > 1 && (
                        <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full flex items-center">
                            <ImageIcon size={12} className="mr-1" /> +{post.attachments!.length - 1}
                        </div>
                    )}
                </div>
            )}

            <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 mb-3 space-x-2">
                    <Calendar size={14} />
                    <time dateTime={post.created_at}>
                        {isScheduled && post.scheduled_at
                            ? format(new Date(post.scheduled_at), 'MMM d, yyyy HH:mm')
                            : format(new Date(post.created_at), 'MMM d, yyyy')}
                    </time>
                    {post.users?.name && (
                        <>
                            <span className="mx-1">•</span>
                            <span>{post.users.name}</span>
                        </>
                    )}
                </div>

                <Link href={`/posts/${post.id}`} className="block group">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                        {post.title !== 'Untitled Post' ? post.title : <span className="italic font-normal text-slate-400 dark:text-slate-500">Untitled Post</span>}
                    </h2>
                </Link>

                <div className="text-slate-600 dark:text-slate-300 mb-4 text-sm flex-grow">
                    {post.cw && !isRevealed ? (
                        <div className="flex flex-col items-center justify-center p-4 bg-slate-100 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 border-dashed">
                            <p className="font-medium text-slate-700 dark:text-slate-300 mb-2">{post.cw}</p>
                            <button
                                onClick={(e) => { e.preventDefault(); setIsRevealed(true); }}
                                className="text-xs bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 px-3 py-1 rounded-full transition-colors flex items-center text-slate-700 dark:text-slate-200"
                            >
                                <Eye size={12} className="mr-1" /> Show Content
                            </button>
                        </div>
                    ) : (
                        <>
                            <p className="line-clamp-3">{summary}</p>
                            {hasPoll && (
                                <div className="mt-3 flex items-center text-xs text-blue-600 dark:text-blue-400 font-medium">
                                    <BarChart2 size={14} className="mr-1" /> Includes Poll
                                </div>
                            )}
                        </>
                    )}
                </div>

                <div className="mt-auto pt-4 flex items-center justify-end">
                    <Link
                        href={`/posts/${post.id}`}
                        className="inline-flex items-center text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors group/btn"
                    >
                        Read more <ArrowRight size={16} className="ml-1 transition-transform group-hover/btn:translate-x-1" />
                    </Link>
                </div>
            </div>
        </article>
    );
};
