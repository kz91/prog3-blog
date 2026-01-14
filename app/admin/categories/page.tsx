'use server'

import Link from 'next/link'
import { createClient } from '../../lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function deleteCategory(id: string) {
    'use server'
    const supabase = await createClient()
    await supabase.from('categories').delete().eq('id', id)
    revalidatePath('/admin/categories')
}

export default async function CategoriesPage() {
    const supabase = await createClient()
    const { data: categories } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false })

    return (
        <div className="max-w-4xl mx-auto py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 px-2">Categories</h1>
                <Link
                    href="/admin/categories/new"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded shadow-sm transition-colors text-sm"
                >
                    Create New
                </Link>
            </div>

            <div className="space-y-4">
                {categories?.map((category) => (
                    <div key={category.id} className="flex items-center justify-between p-4 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded shadow-sm">
                        <div className="font-bold text-slate-800 dark:text-slate-200 ml-4">
                            <Link href={`/admin/posts?categoryId=${category.id}`} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                {category.name}
                            </Link>
                        </div>
                        <div className="flex space-x-3 mr-2">
                            <Link
                                href={`/admin/categories/${category.id}/edit`}
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded shadow-sm transition-colors"
                            >
                                Edit
                            </Link>
                            <form action={deleteCategory.bind(null, category.id)}>
                                <button className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded shadow-sm transition-colors">
                                    Delete
                                </button>
                            </form>
                        </div>
                    </div>
                ))}
                {categories?.length === 0 && (
                    <div className="p-8 text-center text-slate-500 bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                        No categories found.
                    </div>
                )}
            </div>
        </div>
    )
}
