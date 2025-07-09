import React, { useEffect, useState } from 'react';
import { fetchComments, getCurrentUser } from '@/lib/comments';
import CommentItem from './CommentItem';
import NewCommentForm from './NewCommentForm';

export default function CommentThread() {
  const [comments, setComments] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  const loadComments = async () => {
    try {
      const treedata = await fetchComments();
      setComments(treedata);
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

  return (
    <div className="mt-6 space-y-6">
      <NewCommentForm onSuccess={loadComments} />

      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-gray-500">No comments yet.</p>
        ) : (
          comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} onRefresh={loadComments} currentUserId={currentUserId ??-1}/>
          ))
        )}
      </div>
    </div>
  );
}
