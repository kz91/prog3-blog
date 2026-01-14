import { createClient } from '@/app/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    const supabase = await createClient();

    // Custom Auth: Check Cookie
    const sessionCookie = request.cookies.get('user_session');
    if (!sessionCookie) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const user = JSON.parse(sessionCookie.value);

    // Optional: Check Admin Role
    if (user.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        const body = await request.json();
        const {
            title,
            content,
            coverImageURL,
            categoryIds,
            published = true,
            cw,
            hashtags,
            poll
        } = body;

        if (!title || !content) {
            return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
        }

        // Handle Category: Take first ID since we are 1:N currently
        let category_id = null;
        if (categoryIds && Array.isArray(categoryIds) && categoryIds.length > 0) {
            category_id = categoryIds[0];
        }

        const { data, error } = await supabase
            .from('posts')
            .insert({
                title,
                content,
                thumbnail_url: coverImageURL,
                category_id,
                published,
                cw,
                hashtags,
                poll,
                author_id: user.id // Set Admin as author
            })
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data, { status: 201 });
    } catch (err) {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}
