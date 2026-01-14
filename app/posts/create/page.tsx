'use client';

import { addPost } from '../../actions';
import { PostForm } from '../../components/PostForm';

export default function CreatePostPage() {
    return (
        <PostForm action={addPost} />
    );
}
