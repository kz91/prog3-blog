'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search as SearchIcon } from 'lucide-react';

export default function SearchPanel() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [query, setQuery] = useState(searchParams.get('q') || '');
    const [targets, setTargets] = useState<{ title: boolean, content: boolean }>({
        title: false,
        content: false
    });

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (query) params.set('q', query);

        // Target flags
        if (targets.title) params.set('t_title', '1');
        if (targets.content) params.set('t_content', '1');

        router.push(`/?${params.toString()}`);
    };

    const toggleTarget = (key: keyof typeof targets) => {
        setTargets(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 mb-6 shadow-sm dark:shadow-md border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 transition-colors">
            <div className="relative mb-6">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search..."
                    className="w-full bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-700 border rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
            </div>

            <div className="mb-4">
                <div className="bg-slate-50 dark:bg-slate-950 rounded-lg p-4 border border-slate-200 dark:border-slate-800 mb-4 transition-colors">
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-3">Search Targets (Select none for all)</p>
                    <div className="flex gap-2">
                        {['title', 'content'].map((key) => (
                            <button
                                key={key}
                                onClick={() => toggleTarget(key as any)}
                                className={`px-4 py-2 rounded-lg text-xs font-medium border transition-colors ${targets[key as keyof typeof targets]
                                    ? 'bg-blue-100 dark:bg-blue-900/40 border-blue-400 dark:border-blue-500 text-blue-800 dark:text-blue-100'
                                    : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                                    }`}
                            >
                                {key === 'title' ? 'Title' : 'Content'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <button
                onClick={handleSearch}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-full transition-colors shadow-lg shadow-blue-500/20 dark:shadow-blue-900/40"
            >
                Search
            </button>
        </div>
    );
}
