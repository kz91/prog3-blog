import Link from 'next/link'
import { login } from '../auth/actions'

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const params = await searchParams
    const error = params?.error as string
    const message = params?.message as string

    return (
        <div className="flex min-h-[100dvh] flex-col items-center justify-start sm:justify-center pt-10 sm:pt-0 p-0 sm:p-8 bg-white dark:bg-slate-900 sm:bg-slate-50 sm:dark:bg-slate-950">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 sm:rounded-2xl sm:shadow-xl p-6 sm:p-8 sm:border sm:border-slate-200 sm:dark:border-slate-800">
                <h1 className="text-2xl font-bold mb-6 text-center text-slate-800 dark:text-slate-100">
                    Login
                </h1>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
                        <p className="font-semibold">Login Failed</p>
                        <p>{error}</p>
                    </div>
                )}

                {message && (
                    <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-sm text-green-600 dark:text-green-400">
                        <p>{message}</p>
                    </div>
                )}

                <form action={login} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1" htmlFor="email">
                            Email
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1" htmlFor="password">
                            Password
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-blue-500/20 mt-4"
                    >
                        Sign In
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
                    Don't have an account?{' '}
                    <Link href="/signup" className="text-blue-600 dark:text-blue-400 hover:underline">
                        Sign up here
                    </Link>
                </div>
            </div>
        </div>
    )
}
