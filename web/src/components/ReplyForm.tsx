'use client';

import React, { useState } from 'react';
import { addComment } from '@/lib/comments';

export default function ReplyForm({
  parentId,
  onSuccess,
  onCancel,
}: {
  parentId: number;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      setLoading(true);
      await addComment( {content,parentCommentId:parentId });
      setContent('');
      onSuccess(); 
    } catch (err) {
      setError('Failed to post reply');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleReply} className="mt-2 ml-4 space-y-2">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={2}
        placeholder="Write a reply..."
        className="w-full border px-2 py-1 text-sm rounded-md"
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <div className="space-x-2">
        <button
          type="submit"
          disabled={loading}
          className="text-sm px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          {loading ? 'Replying...' : 'Reply'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-sm px-3 py-1 text-gray-600 hover:underline"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
