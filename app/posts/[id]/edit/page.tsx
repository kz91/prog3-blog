
import { getPost } from '../../../lib/db';
import { notFound } from 'next/navigation';
import { PostForm } from '../../../components/PostForm';
import { editPost } from '../../../actions';

export default async function EditPostPage({ params }: { params: { id: string } }) {
    const { id } = await params;
    const post = await getPost(id);

    if (!post) {
        notFound();
    }

    const bindedEditAction = editPost.bind(null, post.id);

    return (
        <PostForm initialData={post} action={bindedEditAction} isEditing={true} />
    );
}
