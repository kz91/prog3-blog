import { createClient } from './supabase/server';
import { Post } from './types';

// NOTE: Since these functions are used in Server Actions/Components, 
// we can use the server client.

export async function getPosts(categoryId?: string): Promise<Post[]> {
    const supabase = await createClient();
    let query = supabase
        .from('posts')
        .select('*, users(name)')
        .order('created_at', { ascending: false });

    if (categoryId) {
        query = query.eq('category_id', categoryId);
    }

    const { data: posts, error } = await query;

    if (error) {
        console.error('Error fetching posts:', error);
        return [];
    }
    return posts || [];
}

export async function votePost(id: string, optionIndex: number): Promise<void> {
    const supabase = await createClient();
    // Fetch current poll
    const { data: post } = await supabase
        .from('posts')
        .select('poll')
        .eq('id', id)
        .single();

    if (post && post.poll && post.poll.options[optionIndex]) {
        const newPoll = { ...post.poll };
        newPoll.options[optionIndex].votes += 1;

        await supabase
            .from('posts')
            .update({ poll: newPoll, updated_at: new Date().toISOString() })
            .eq('id', id);
    }
}

export async function getPost(id: string): Promise<Post | null> {
    const supabase = await createClient();
    const { data: post, error } = await supabase
        .from('posts')
        .select('*, users(name)')
        .eq('id', id)
        .single();

    if (error) return null;
    return post;
}

export async function createPost(post: Omit<Post, 'id' | 'created_at'>): Promise<Post> {
    const supabase = await createClient();
    const { data: newPost, error } = await supabase
        .from('posts')
        .insert({
            ...post,
            // Supabase handles id and created_at default, but if we need to set them explicitly or handle logic:
            // We pass the fields we have. 
            // Note: Our Post type has optional poll/attachments etc., Supabase schema should match.
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating post:', error);
        throw new Error('Failed to create post');
    }
    return newPost;
}

export async function deletePost(id: string): Promise<void> {
    const supabase = await createClient();
    await supabase.from('posts').delete().eq('id', id);
}

export async function updatePost(post: Post): Promise<void> {
    const supabase = await createClient();
    // Exclude id from update payload usually, but here we just update matching ID
    const { id, created_at, ...updates } = post;

    await supabase
        .from('posts')
        .update({
            ...updates,
            updated_at: new Date().toISOString()
        })
        .eq('id', id);
}

