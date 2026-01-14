import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '../lib/supabase/server';
import { revalidatePath } from 'next/cache';

export default async function SettingsPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const params = await searchParams;
    const message = params?.message as string;
    const error = params?.error as string;

    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('user_session');

    if (!sessionCookie) {
        redirect('/login');
    }

    const user = JSON.parse(sessionCookie.value);

    async function updateProfile(formData: FormData) {
        'use server'

        const name = (formData.get('name') as string).trim();
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get('user_session');

        if (!sessionCookie) redirect('/login');

        const currentUser = JSON.parse(sessionCookie.value);
        const supabase = await createClient();

        // Update public.users
        const { error: updateError } = await supabase
            .from('users')
            .update({ name })
            .eq('id', currentUser.id);

        if (updateError) {
            redirect(`/settings?error=${encodeURIComponent(updateError.message)}`);
        }

        // Update Session Cookie
        currentUser.name = name;
        cookieStore.set('user_session', JSON.stringify(currentUser), {
            path: '/',
            httpOnly: true,
            maxAge: 60 * 60 * 24 * 7 // 1 week
        });

        revalidatePath('/', 'layout');
        redirect('/settings?message=Profile updated successfully');
    }

    return (
        <div className="max-w-2xl mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-8">Settings</h1>

            <div className="bg-white dark:bg-slate-900 shadow rounded-lg p-6 border border-slate-200 dark:border-slate-800">
                <h2 className="text-xl font-semibold mb-6 text-slate-800 dark:text-slate-200">Profile Settings</h2>

                {message && (
                    <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-sm text-green-600 dark:text-green-400">
                        {message}
                    </div>
                )}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
                        {error}
                    </div>
                )}

                <form action={updateProfile} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Email (Read Only)
                        </label>
                        <input
                            type="text"
                            id="email"
                            value={user.email}
                            disabled
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                        />
                    </div>

                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Display Name
                        </label>
                        <input
                            type="text"
                            name="name"
                            id="name"
                            defaultValue={user.name || user.email.split('@')[0]}
                            required
                            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            This name will be displayed on your posts.
                        </p>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
