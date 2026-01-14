export interface Post {
    id: string; // Changed to string for UUID or easy ID generation
    title: string;
    content: string;
    created_at: string;
    thumbnail_url?: string; // Kept for backward compatibility, but attachments is preferred
    published: boolean;
    // New features
    attachments?: string[];
    poll?: {
        question: string;
        options: { text: string; votes: number }[];
    };
    cw?: string;
    author_id?: string;
    scheduled_at?: string;
    users?: {
        name: string;
    };
}
