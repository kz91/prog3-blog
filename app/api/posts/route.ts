import { createClient } from '@/app/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
    const supabase = await createClient();
    // Fetch posts with category info
    // Using 'categories' as the relation name, assuming Supabase inferred it from FK.
    // If strict M:N is expected by frontend, we might need to transform the response.
    // But standard PostgREST returns object for 1:N.

    const { data, error } = await supabase
        .from('posts')
        .select('*, categories(id, name), users(name)')
        .order('created_at', { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}
