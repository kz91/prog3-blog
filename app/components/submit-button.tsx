'use client';

import { useFormStatus } from 'react-dom';
import { Send, Loader2 } from 'lucide-react';

export function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
            {pending ? (
                <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
            ) : (
                <Send className="-ml-1 mr-2 h-4 w-4" />
            )}
            {pending ? 'Posting...' : 'Post'}
        </button>
    );
}
