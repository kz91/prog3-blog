import { getPosts } from './lib/db';
import { PostCard } from './components/PostCard';
import SearchPanel from './components/SearchPanel';

interface HomeProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Home({ searchParams }: HomeProps) {
    const params = await searchParams;
    const allPosts = await getPosts();
    const now = new Date();

    // 1. Basic Visibility Filter (Published & Scheduled logic)
    // "Published means visible, but if scheduled in future, hide it"
    let displayPosts = allPosts.filter(p => {
        if (!p.published) return false;
        if (p.scheduled_at && new Date(p.scheduled_at) > now) return false;
        return true;
    });

    // 2. Search Filter
    const query = typeof params.q === 'string' ? params.q.toLowerCase() : '';
    const targetTitle = params.t_title === '1';
    const targetContent = params.t_content === '1';
    // If no specific target selected, search all
    const searchAll = !targetTitle && !targetContent;

    if (query) {
        displayPosts = displayPosts.filter(p => {
            const matchTitle = p.title?.toLowerCase().includes(query);
            const matchContent = p.content.toLowerCase().includes(query);
            if (searchAll) {
                return matchTitle || matchContent;
            }

            return (targetTitle && matchTitle) ||
                (targetContent && matchContent);
        });
    }

    return (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Left Sidebar (Search) */}
                <aside className="w-full lg:w-80 flex-shrink-0 order-1 lg:order-1">
                    <SearchPanel />
                </aside>

                {/* Main Feed */}
                <div className="flex-1 order-2">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                            Latest Posts
                        </h1>
                        <span className="text-sm text-slate-500 dark:text-slate-400 font-medium bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                            {displayPosts.length} posts
                        </span>
                    </div>

                    {displayPosts.length === 0 ? (
                        <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                            <p className="text-slate-500 dark:text-slate-400 text-lg">No posts found matching your criteria.</p>
                            {query && (
                                <p className="text-sm text-slate-400 dark:text-slate-500 mt-2">Try adjusting your search terms.</p>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {displayPosts.map((post) => (
                                <PostCard key={post.id} post={post} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
