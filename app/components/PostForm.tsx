'use client';

import { Post } from '../lib/types';
import { SubmitButton } from './submit-button';
import {
    Image as ImageIcon,
    List,
    EyeOff,
    Calendar,
    X,
    Upload,
    Link as LinkIcon,
    Plus
} from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { uploadImage } from '../actions';

interface PostFormProps {
    initialData?: Post;
    action: (formData: FormData) => void;
    isEditing?: boolean;
}

export function PostForm({ initialData, action, isEditing = false }: PostFormProps) {
    const [content, setContent] = useState(initialData?.content || '');

    // Feature Toggles
    const [showPoll, setShowPoll] = useState(!!initialData?.poll);
    const [showCW, setShowCW] = useState(!!initialData?.cw);
    const [showSchedule, setShowSchedule] = useState(!!initialData?.scheduled_at);
    const [showAttachMenu, setShowAttachMenu] = useState(false);

    // Data State
    const [attachments, setAttachments] = useState<File[]>([]);
    // Initialize previews with existing attachment URLs
    const [previews, setPreviews] = useState<string[]>(initialData?.attachments || []);

    // Initialize poll options
    const [pollOptions, setPollOptions] = useState(
        initialData?.poll?.options.map(o => o.text) || ['', '']
    );
    const [pollMultiple, setPollMultiple] = useState(false); // Note: Post type doesn't seem to store this? Checked types.ts, it's not there.
    const [pollDuration, setPollDuration] = useState('no_limit'); // Also not in Post type explicitly?

    const fileInputRef = useRef<HTMLInputElement>(null);
    const attachMenuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (attachMenuRef.current && !attachMenuRef.current.contains(event.target as Node)) {
                setShowAttachMenu(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setAttachments([...attachments, ...newFiles]);

            const newPreviews = newFiles.map(f => URL.createObjectURL(f));
            setPreviews([...previews, ...newPreviews]);
        }
        setShowAttachMenu(false);
    };

    const addUrlAttachment = () => {
        const url = prompt("Enter Image URL:");
        if (url) {
            setPreviews([...previews, url]);
        }
        setShowAttachMenu(false);
    };

    const removeAttachment = (index: number) => {
        const numInitial = (initialData?.attachments?.length || 0);

        // If the removed item is a newly added file (not from initialData)
        if (index >= numInitial) {
            const attachmentIndex = index - numInitial;
            if (attachmentIndex < attachments.length) {
                const newAttachments = [...attachments];
                newAttachments.splice(attachmentIndex, 1);
                setAttachments(newAttachments);
            }
        }

        const newPreviews = [...previews];
        // Revoke URL if it's a blob URL (for newly added files)
        if (newPreviews[index].startsWith('blob:')) {
            URL.revokeObjectURL(newPreviews[index]);
        }
        newPreviews.splice(index, 1);
        setPreviews(newPreviews);
    };

    const updatePollOption = (index: number, value: string) => {
        const newOpts = [...pollOptions];
        newOpts[index] = value;
        setPollOptions(newOpts);
    };

    const removePollOption = (index: number) => {
        const newOpts = pollOptions.filter((_, i) => i !== index);
        setPollOptions(newOpts);
    };

    const insertText = (text: string) => {
        setContent(prev => prev + text);
    };

    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [scheduledDate, setScheduledDate] = useState<string>(initialData?.scheduled_at || '');
    const [tempScheduledDate, setTempScheduledDate] = useState<string>(initialData?.scheduled_at || '');

    const handleScheduleSave = () => {
        setScheduledDate(tempScheduledDate);
        setShowScheduleModal(false);
        setShowSchedule(true);
    };

    const clearSchedule = () => {
        setScheduledDate('');
        setShowSchedule(false);
    };

    const [isUploading, setIsUploading] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleUpload = async (files: File[]) => {
        const imageFiles = files.filter(f => f.type.startsWith('image/'));
        if (imageFiles.length === 0) return;

        setIsUploading(true);
        try {
            for (const file of imageFiles) {
                // Optimistic visual feedback could go here, but strictly we wait for URL
                const formData = new FormData();
                formData.append('file', file);
                const url = await uploadImage(formData);

                // Insert markdown at cursor
                const markdown = `![${file.name}](${url})`;

                setContent(prev => {
                    // We need to find cursor position, but state updates might desync from DOM if not careful.
                    // For simplicity, append or try to insert if ref is current.
                    // React state update is async. Best to just append if not focused? 
                    // Or standard insert-at-end if no cursor tracking.
                    // Actually, getting cursor pos from ref might key off OLD content if we use 'prev'.
                    // But 'prev' is precise. 
                    // Let's just append for now to be safe, or use simple replacement?
                    // Better: standard textarea insertion logic.

                    /* Simple Append for robustness or... */
                    /* Let's try to do cursor insertion if possible */
                    const textarea = document.querySelector('textarea[name="content"]') as HTMLTextAreaElement;
                    if (textarea) {
                        const start = textarea.selectionStart;
                        const end = textarea.selectionEnd;
                        const text = textarea.value; // effective current value in DOM might be best source of truth for cursor integration?
                        // No, 'prev' is source of truth for state.
                        // If we use 'prev', we assume 'start'/'end' match it.
                        // Usually ok.

                        const before = text.substring(0, start);
                        const after = text.substring(end);
                        return before + markdown + after;
                    }
                    return prev + '\n' + markdown;
                });
            }
        } catch (error) {
            console.error(error);
            alert('Failed to upload image');
        } finally {
            setIsUploading(false);
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        if (e.clipboardData.files.length > 0) {
            e.preventDefault();
            handleUpload(Array.from(e.clipboardData.files));
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer.files.length > 0) {
            handleUpload(Array.from(e.dataTransfer.files));
        }
    };

    return (
        <div className="max-w-6xl mx-auto h-[calc(100vh-100px)] flex gap-6 p-4 animate-in fade-in duration-500">
            {/* Modal Overlay */}
            {showScheduleModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-[#1e293b] rounded-2xl shadow-2xl p-6 w-full max-w-sm border border-slate-700">
                        <h3 className="text-center text-white font-bold text-lg mb-6">Set Schedule</h3>

                        <div className="relative mb-8">
                            <input
                                type="datetime-local"
                                value={tempScheduledDate}
                                onChange={(e) => setTempScheduledDate(e.target.value)}
                                className="w-full bg-[#1e293b] border border-blue-400 rounded-lg px-4 py-3 text-white text-xl text-center outline-none focus:ring-2 focus:ring-blue-500 font-mono tracking-wider"
                            />
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={handleScheduleSave}
                                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-full transition-colors"
                            >
                                OK
                            </button>
                            <button
                                onClick={() => setShowScheduleModal(false)}
                                className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-full transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Left: Editor */}
            <div className="flex-1 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden relative transition-colors">
                {/* ... (Header) */}
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-between items-center transition-colors">
                    <h1 className="font-bold text-slate-700 dark:text-slate-200">
                        {isEditing ? 'Edit Post' : 'New Post'}
                    </h1>
                </div>

                <form action={action} className="flex-1 flex flex-col min-h-0">
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">

                        {/* Title */}
                        <input
                            type="text"
                            name="title"
                            defaultValue={initialData?.title}
                            placeholder="Title (Optional)"
                            className="w-full text-lg font-bold placeholder:text-slate-400 dark:placeholder:text-slate-600 border-none outline-none bg-transparent text-slate-900 dark:text-slate-100"
                        />

                        {/* CW Input */}
                        {showCW && (
                            <div className="animate-in slide-in-from-top-2">
                                <input
                                    type="text"
                                    name="cw"
                                    defaultValue={initialData?.cw}
                                    placeholder="Content Warning / Summary..."
                                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-950 rounded-lg text-sm border border-transparent focus:border-blue-500 outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-slate-200 transition-colors"
                                />
                            </div>
                        )}

                        {/* Main Content */}
                        <div className="relative flex-1 flex flex-col min-h-[12rem]">
                            {isUploading && (
                                <div className="absolute inset-0 z-10 bg-white/50 dark:bg-slate-900/50 flex items-center justify-center backdrop-blur-sm transition-opacity">
                                    <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-full shadow-lg border border-slate-200 dark:border-slate-700 flex items-center space-x-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent" />
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Uploading image...</span>
                                    </div>
                                </div>
                            )}
                            <textarea
                                name="content"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                onPaste={handlePaste}
                                onDrop={handleDrop}
                                placeholder="What's on your mind? (Drag & Drop images here)"
                                className="w-full h-full resize-none border-none outline-none text-slate-800 dark:text-slate-200 text-lg placeholder:text-slate-400 dark:placeholder:text-slate-600 bg-transparent flex-1 transition-colors p-0"
                            />
                        </div>



                        {/* Scheduled Banner (Between Hashtag and Poll/Attachments) */}
                        {scheduledDate && (
                            <div className="bg-[#1e293b] px-4 py-2 flex items-center justify-between animate-in fade-in border-y border-slate-700">
                                <div className="flex items-center space-x-2 text-white text-sm">
                                    <Calendar size={16} className="text-slate-300" />
                                    <span>Scheduled for {new Date(scheduledDate).toLocaleString()}</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={clearSchedule}
                                    className="text-slate-400 hover:text-white transition-colors"
                                >
                                    <X size={16} />
                                </button>
                                <input type="hidden" name="scheduled_at" value={scheduledDate} />
                            </div>
                        )}

                        {/* Attachments Preview */}
                        {previews.length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {previews.map((src, i) => (
                                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden group bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                                        <img src={src} alt="preview" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeAttachment(i)}
                                            className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-100 transition-opacity hover:bg-black/80"
                                        >
                                            <X size={14} />
                                        </button>
                                        {/* Hidden input for existing attachment URLs */}
                                        {!src.startsWith('blob:') && (
                                            <input type="hidden" name="attachment_urls" value={src} />
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Poll Editor */}
                        {showPoll && (
                            <div className="bg-slate-50 dark:bg-[#0f172a]/50 p-4 rounded-xl space-y-4 animate-in fade-in border border-slate-200 dark:border-slate-800 transition-colors">
                                <div className="space-y-2">
                                    {pollOptions.map((opt, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                name="poll_option"
                                                value={opt}
                                                onChange={(e) => updatePollOption(i, e.target.value)}
                                                placeholder={`Option ${i + 1}`}
                                                className="w-full px-3 py-2 rounded-md text-sm border outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-[#1e293b] text-slate-900 dark:text-white border-slate-300 dark:border-slate-700 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-colors shadow-sm"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removePollOption(i)}
                                                className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 p-1 transition-colors"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setPollOptions([...pollOptions, ''])}
                                    className="w-24 bg-slate-200 dark:bg-blue-900/80 hover:bg-slate-300 dark:hover:bg-blue-800 text-slate-700 dark:text-blue-100 text-sm font-medium py-1.5 px-3 rounded-md transition-colors"
                                >
                                    Add
                                </button>

                                {/* ... (rest of poll UI: multiple toggle, duration) */}
                                <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800 mt-2">
                                    <div className="flex items-center justify-between pt-2">
                                        <label className="text-sm text-slate-600 dark:text-slate-400">Multiple Choice</label>
                                        <div
                                            className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${pollMultiple ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                                            onClick={() => setPollMultiple(!pollMultiple)}
                                        >
                                            <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform ${pollMultiple ? 'translate-x-4' : ''}`} />
                                            <input type="hidden" name="poll_multiple" value={pollMultiple ? 'true' : 'false'} />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">Duration</label>
                                        <select
                                            name="poll_duration"
                                            value={pollDuration}
                                            onChange={(e) => setPollDuration(e.target.value)}
                                            className="w-full rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                                        >
                                            <option value="no_limit">No Limit</option>
                                            <option value="1_hour">1 Hour</option>
                                            <option value="24_hours">24 Hours</option>
                                            <option value="3_days">3 Days</option>
                                            <option value="7_days">7 Days</option>
                                        </select>
                                    </div>
                                </div>
                                <input type="hidden" name="poll_question" value="Poll" />
                            </div>
                        )}

                        {/* Hidden File Input */}
                        <input
                            type="file"
                            name="file"
                            ref={fileInputRef}
                            multiple
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileSelect}
                        />
                    </div>

                    {/* Toolbar */}
                    <div className="p-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900 relative transition-colors">
                        <div className="flex items-center space-x-2">
                            {/* Attachments */}
                            <div className="relative" ref={attachMenuRef}>
                                <button
                                    type="button"
                                    onClick={() => setShowAttachMenu(!showAttachMenu)}
                                    className={`p-2 rounded-full transition-colors ${showAttachMenu ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800'}`}
                                    title="サムネイル追加"
                                >
                                    <ImageIcon size={20} />
                                </button>
                                {/* ... (dropdown logic) */}
                                {showAttachMenu && (
                                    <div className="absolute bottom-full left-0 mb-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl overflow-hidden z-20 animate-in fade-in slide-in-from-bottom-2 border border-slate-200 dark:border-slate-700 transition-colors">
                                        <div className="p-3 text-xs font-bold text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                                            Add Thumbnail
                                        </div>
                                        <div className="py-1">
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="w-full text-left px-4 py-3 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center space-x-3 transition-colors text-sm"
                                            >
                                                <Upload size={16} />
                                                <span>Upload</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={addUrlAttachment}
                                                className="w-full text-left px-4 py-3 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center space-x-3 transition-colors text-sm"
                                            >
                                                <LinkIcon size={16} />
                                                <span>From URL</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={() => setShowPoll(!showPoll)}
                                className={`p-2 rounded-full transition-colors ${showPoll ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800'}`}
                                title="Create poll"
                            >
                                <List size={20} />
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowCW(!showCW)}
                                className={`p-2 rounded-full transition-colors ${showCW ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800'}`}
                                title="Content Warning"
                            >
                                <EyeOff size={20} />
                            </button>



                            {/* Schedule Button - Updated to toggle Modal */}
                            <button
                                type="button"
                                onClick={() => {
                                    setTempScheduledDate(scheduledDate || new Date().toISOString().slice(0, 16));
                                    setShowScheduleModal(true);
                                }}
                                className={`p-2 rounded-full transition-colors ${scheduledDate ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800'}`}
                                title="Schedule"
                            >
                                <Calendar size={20} />
                            </button>
                        </div>

                        <div className="w-32">
                            <SubmitButton />
                        </div>
                    </div>
                </form>
            </div>
            {/* Same Live Preview... */}
            <div className="hidden lg:block w-1/2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 overflow-y-auto transition-colors">
                {/* ... (keep existing preview) */}
                <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">Preview</h2>

                <article className="bg-white dark:bg-slate-950 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden text-slate-900 dark:text-slate-200 transition-colors">
                    <div className="p-6">
                        <h1 className="text-2xl font-bold mb-4 whitespace-pre-wrap">
                            {content || <span className="text-slate-300 dark:text-slate-600 italic">Post content...</span>}
                        </h1>

                        {previews.length > 0 && (
                            <div className="grid grid-cols-2 gap-2 mb-4">
                                {previews.map((src, i) => (
                                    <img key={i} src={src} className="rounded-lg object-cover w-full h-32 bg-slate-100 dark:bg-slate-800" />
                                ))}
                            </div>
                        )}

                        {showPoll && pollOptions.some(o => o) && (
                            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg space-y-2 border border-slate-200 dark:border-slate-800">
                                <p className="font-medium text-slate-700 dark:text-slate-300">Poll</p>
                                {pollOptions.filter(o => o).map((opt, i) => (
                                    <div key={i} className="w-full bg-white dark:bg-slate-950 px-3 py-2 rounded border border-slate-200 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-300">
                                        {opt}
                                    </div>
                                ))}
                                <div className="text-xs text-slate-500 dark:text-slate-500 mt-2">
                                    {pollMultiple ? 'Multiple Choice' : 'Single Choice'} • {pollDuration === 'no_limit' ? 'No Time Limit' : pollDuration}
                                </div>
                            </div>
                        )}
                    </div>
                </article>
            </div>
        </div>
    );
}
