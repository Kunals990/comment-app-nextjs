'use client';

import React, { useEffect, useState } from 'react';
import { fetchPaginatedComments, getCurrentUser } from '@/lib/comments';
import CommentItem from './CommentItem';
import NewCommentForm from './NewCommentForm';

export default function CommentThread() {
  const [comments, setComments] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadComments = async (pageNumber = 1) => {
    try {
      const data = await fetchPaginatedComments(pageNumber);
      setComments(data.comments ?? []);
      console.log(data.comments);
      setTotalPages(data.totalPages);
      setPage(pageNumber);
    } catch (err) {
      console.error('Failed to load comments:', err);
    }
  };

  useEffect(() => {
    loadComments();
    getCurrentUser()
      .then((user) => setCurrentUserId(user.id))
      .catch(() => setCurrentUserId(null));
  }, []);

  const handlePrev = () => {
    if (page > 1) loadComments(page - 1);
  };

  const handleNext = () => {
    if (page < totalPages) loadComments(page + 1);
  };

  return (
    <div className="mt-6 space-y-6">
      <NewCommentForm onSuccess={() => loadComments(page)} />

      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-gray-500">No comments yet.</p>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onRefresh={() => loadComments(page)}
              currentUserId={currentUserId ?? -1}
            />
          ))
        )}
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-center gap-4 mt-6">
        <button
          onClick={handlePrev}
          disabled={page === 1}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-gray-600">
          Page {page} of {totalPages}
        </span>
        <button
          onClick={handleNext}
          disabled={page === totalPages}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
