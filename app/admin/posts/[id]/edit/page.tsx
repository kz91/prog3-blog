'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';

interface Category {
    id: string;
    name: string;
}

export default function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [coverImageURL, setCoverImageURL] = useState('');
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Fetch categories and post data
        Promise.all([
            fetch('/api/categories').then(res => res.json()),
            fetch(`/api/posts/${id}`).then(res => {
                if (!res.ok) throw new Error('Post not found');
                return res.json();
            })
        ]).then(([categoriesData, postData]) => {
            setCategories(categoriesData);
            setTitle(postData.title);
            setContent(postData.content);
            setCoverImageURL(postData.thumbnail_url || '');
            // Handle setting initial category.
            // If categories is single object: postData.categories.id
            // If array: postData.categories[0].id
            if (postData.categories) {
                if (Array.isArray(postData.categories)) {
                    if (postData.categories.length > 0) setSelectedCategoryId(postData.categories[0].id);
                } else if (typeof postData.categories === 'object') {
                    setSelectedCategoryId(postData.categories.id || '');
                }
            }
            // If using category_id directly if exposed:
            if (postData.category_id && !selectedCategoryId) {
                setSelectedCategoryId(postData.category_id);
            }

            setLoading(false);
        }).catch(err => {
            console.error(err);
            alert('Error loading data');
            router.push('/admin/posts');
        });
    }, [id, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch(`/api/admin/posts/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title,
                    content,
                    coverImageURL,
                    categoryIds: selectedCategoryId ? [selectedCategoryId] : [],
                }),
            });

            if (!res.ok) throw new Error('Failed to update post');

            router.push('/admin/posts');
            router.refresh();
        } catch (error) {
            alert('Error updating post');
            setLoading(false);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6 text-slate-900 dark:text-slate-100">Edit Post</h1>
            <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Title
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Cover Image URL
                    </label>
                    <input
                        type="url"
                        value={coverImageURL}
                        onChange={(e) => setCoverImageURL(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Category
                    </label>
                    <select
                        value={selectedCategoryId}
                        onChange={(e) => setSelectedCategoryId(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                    >
                        <option value="">Select a Category</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Content
                    </label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={10}
                        className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50"
                >
                    {loading ? 'Updating...' : 'Update'}
                </button>
            </form>
        </div>
    );
}
