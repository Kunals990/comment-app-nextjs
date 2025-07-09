'use client';

import React, { useState } from 'react';
import { addComment } from '@/lib/comments'; 
import { useRouter } from 'next/navigation';

export default function NewCommentForm({ onSuccess }: { onSuccess: () => void }) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) return;

    try {
      setLoading(true);
      setError(null);
      setIsUnauthorized(false);

      await addComment({content}); 

      setContent('');
      onSuccess(); 
    } catch (err: any) {
      if (err.message?.includes('Unauthorized') || err.statusCode === 401) {
        setIsUnauthorized(true);
        setError('You need to be logged in to post comments.');
      } else {
        setError(`${err.message || 'Unknown error'}`);
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    router.push('/login');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        placeholder="Write a comment..."
        className="w-full border rounded-md px-3 py-2 text-sm resize-none"
      />
      {error && (
        <div className="text-red-500 text-sm">
          <p>{error}</p>
          {isUnauthorized && (
            <button
              type="button"
              onClick={handleLogin}
              className="mt-2 px-3 py-1 text-sm rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              Go to Login
            </button>
          )}
        </div>
      )}
      <button
        type="submit"
        disabled={loading}
        className="px-4 py-1 text-sm rounded-md text-white bg-blue-600 hover:bg-blue-700"
      >
        {loading ? 'Posting...' : 'Post Comment'}
      </button>
    </form>
  );
}