'use server';

import { createPost, deletePost, votePost, getPost, updatePost } from './lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { cookies } from 'next/headers';

async function saveFile(file: File): Promise<string> {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ensure upload directory exists
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });

    // Create unique filename
    const ext = path.extname(file.name);
    const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}${ext}`;
    const filepath = path.join(uploadDir, filename);

    await writeFile(filepath, buffer);
    return `/uploads/${filename}`;
}

export async function addPost(formData: FormData) {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('user_session');

    if (!sessionCookie) {
        redirect('/login');
    }
    const user = JSON.parse(sessionCookie.value);

    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const cw = formData.get('cw') as string;
    const scheduled_at = formData.get('scheduled_at') as string;
    const published = !scheduled_at;

    const files = formData.getAll('file') as File[];
    const attachments: string[] = [];
    for (const file of files) {
        if (file.size > 0) {
            const url = await saveFile(file);
            attachments.push(url);
        }
    }

    const attachmentUrls = formData.getAll('attachment_urls') as string[];
    attachmentUrls.forEach(url => attachments.push(url));

    const pollQuestion = formData.get('poll_question') as string;
    const pollOptionsRaw = formData.getAll('poll_option') as string[];
    const pollOptions = pollOptionsRaw.filter(o => o.trim() !== '').map(text => ({ text, votes: 0 }));

    let poll = undefined;
    if (pollOptions.length > 0) {
        poll = {
            question: pollQuestion || 'Poll',
            options: pollOptions
        };
    }



    await createPost({
        title: title || 'Untitled Post',
        content,
        thumbnail_url: attachments[0],
        published: true,
        attachments,
        poll,
        cw: cw || undefined,
        scheduled_at: scheduled_at || undefined,

        author_id: user.id // Set author_id from session
    });

    revalidatePath('/');
    redirect('/');
}

export async function removePost(id: string) {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('user_session');

    if (!sessionCookie) {
        redirect('/login');
    }
    // const user = JSON.parse(sessionCookie.value); 
    // In a real app we might check if user.id === post.author_id or user.role === 'admin'
    // For now assuming existing logic allows it if logged in (or relying on middleware/UI hiding)

    await deletePost(id);
    revalidatePath('/');
    redirect('/');
}

export async function castVote(postId: string, optionIndex: number) {
    await votePost(postId, optionIndex);
    revalidatePath('/');
    revalidatePath(`/posts/${postId}`);
}

export async function editPost(id: string, formData: FormData) {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('user_session');

    if (!sessionCookie) {
        redirect('/login');
    }

    const existingPost = await getPost(id);
    if (!existingPost) {
        throw new Error("Post not found");
    }

    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const cw = formData.get('cw') as string;
    const scheduled_at = formData.get('scheduled_at') as string;

    const attachmentIds = formData.getAll('attachment_urls') as string[];
    const files = formData.getAll('file') as File[];
    const uploads = await Promise.all(
        files.map(async (file) => {
            if (file.size === 0) return null;
            return await saveFile(file);
        })
    );
    const newAttachments = uploads.filter(url => url !== null) as string[];
    const attachments = [...attachmentIds, ...newAttachments];

    const pollQuestion = formData.get('poll_question') as string;
    const polloptions = formData.getAll('poll_option') as string[];

    let poll = undefined;
    if (pollQuestion && polloptions.some(o => o.trim() !== '')) {
        const validOptions = polloptions.filter(o => o.trim() !== '');
        const newOptions = validOptions.map(text => {
            const existingOpt = existingPost.poll?.options.find(o => o.text === text);
            return { text, votes: existingOpt ? existingOpt.votes : 0 };
        });

        if (validOptions.length > 0) {
            poll = {
                question: pollQuestion,
                options: newOptions
            };
        }
    }



    await updatePost({
        ...existingPost,
        title: title || 'Untitled Post',
        content,
        thumbnail_url: attachments[0],
        attachments,
        poll: poll || (pollQuestion ? undefined : existingPost.poll),
        cw: cw || undefined,
        scheduled_at: scheduled_at || undefined,

    });

    revalidatePath('/');
    revalidatePath(`/posts/${id}`);
    redirect(`/posts/${id}`);
}

export async function uploadImage(formData: FormData) {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('user_session');

    if (!sessionCookie) {
        throw new Error('Unauthorized');
    }

    try {
        const file = formData.get('file') as File;
        if (!file || file.size === 0) {
            console.error('Upload failed: No file provided');
            throw new Error('No file uploaded');
        }

        console.log(`Processing upload: ${file.name} (${file.type}, ${file.size} bytes)`);

        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!validTypes.includes(file.type)) {
            console.warn(`Warning: Uploading file with type ${file.type}. Allowed types: ${validTypes.join(', ')}`);
        }

        return await saveFile(file);
    } catch (error) {
        console.error('Upload Error:', error);
        throw new Error('Image upload failed');
    }
}
